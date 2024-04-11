import * as vscode from "vscode";
import { IaApiInterface } from '../../api/interfaceApi';
import { ChatApi } from '../../api/chatApi';
import { PREFIX_DITO, logger } from "../../logger";
import { updateContextKey } from "../../extension";
import { getDitoConfiguration, setDitoReady } from "../../config";
import { promiseFromEvent } from "../../util";

export function registerHealth(context: vscode.ExtensionContext, iaApi: IaApiInterface, chatApi: ChatApi): void {

    /**
     * Registers a health check command that checks the health of the Dito service. 
     * Shows a detailed error message if the health check fails.
     * On success, logs in the user automatically.
    */
    context.subscriptions.push(vscode.commands.registerCommand('tds-dito.health', async (...args) => {
        let detail: boolean = true;
        let attempt: number = 1;

        if (args.length > 0) {
            if (!args[0]) { //solicitando verificação sem detalhes
                detail = false;
            }
            if (args[1]) { //numero da tentativa de auto-reconexão
                attempt = args[1];
            }
        }

        let messageId: string = "";
        if (attempt == 1) {
            messageId = chatApi.dito(vscode.l10n.t("Verifying service availability."));
        }

        return new Promise((resolve, reject) => {
            const totalAttempts: number = getDitoConfiguration().tryAutoReconnection;

            iaApi.checkHealth(detail).then(async (error: any) => {
                updateContextKey("readyForUse", error === undefined);
                setDitoReady(error === undefined);

                if (error !== undefined) {
                    if (messageId != "") {
                        const message: string = vscode.l10n.t("Sorry, I have technical difficulties. {0}", chatApi.commandText("health"));
                        chatApi.dito(message, messageId);
                        vscode.window.showErrorMessage(`${PREFIX_DITO} ${message}`);
                    }

                    if (error.message.includes("502: Bad Gateway")) {
                        const parts: string = error.message.split("\n");
                        const time: RegExpMatchArray | null = parts[1].match(/(\d+) seconds/i);
                        if (attempt == 1) {
                            chatApi.ditoInfo(parts[1]);
                        }

                        if ((attempt <= totalAttempts) && (time !== null)) {
                            tryAgain(attempt, totalAttempts, Number.parseInt(time[1])).then(
                                () => {
                                    vscode.commands.executeCommand("tds-dito.health", false, ++attempt);
                                },
                                (reason: string) => {
                                    vscode.window.showErrorMessage(`${PREFIX_DITO} ${reason}`);
                                    logger.info(reason)
                                }
                            );
                        } else if (totalAttempts != 0) {
                            chatApi.dito([
                                vscode.l10n.t("Sorry, even after **{0} attempts**, I still have technical difficulties.", totalAttempts),
                                vscode.l10n.t("To restart the validation of the service, activate {0}.", chatApi.commandText("health"))
                            ], messageId);
                        }
                    } else {
                        chatApi.dito(vscode.l10n.t("Available service!"), messageId);
                        vscode.window.showInformationMessage(`${PREFIX_DITO} Available service!`);
                    }

                    if (detail) {
                        chatApi.ditoInfo(JSON.stringify(error, undefined, 2));
                    }
                } else {
                    vscode.commands.executeCommand("tds-dito.login", true).then(() => {
                        chatApi.checkUser(messageId);
                    });
                }
            })
        });
    }));

}

function tryAgain(attempt: number, totalAttempt: number, time: number): Promise<void> {

    return new Promise<void>((resolve, reject) => {
        vscode.window.withProgress<string>({
            location: vscode.ProgressLocation.Notification,
            title: `${PREFIX_DITO.trim()}`,
            cancellable: true
        }, async (progress, token) => {
            const timeoutPromise = new Promise<string>((_, reject) => setTimeout(() => reject('Timeout'), 60000));
            const cancelPromise = promiseFromEvent<any, any>(token.onCancellationRequested, (_, __, reject) => { reject(vscode.l10n.t('User Cancelled')); }).promise;
            const delayPromise = new Promise<string>((resolve, _) => {

                const interval = setInterval(() => {
                    const msg: string = vscode.l10n.t("Verificando disponibilidade em {0} segundos. ({1}/{2})", time, attempt, totalAttempt);
                    progress.report({ message: msg });
                    if (time % 10 === 0) {
                        logger.info(msg);
                    }
                    if (token.isCancellationRequested) {
                        clearInterval(interval);
                    } else {
                        time--;
                        if (time < 1) {
                            clearInterval(interval);
                            resolve('');
                        }
                    }
                }, 1000);
            });

            await Promise.race([timeoutPromise, cancelPromise, delayPromise])
                .then(resolve)
                .catch(reject);

            return "";
        });
    });
}
