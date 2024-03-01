import * as vscode from "vscode";

import { getDitoUser, isDitoFirstUse, isDitoLogged, isDitoReady } from "../config";
import { Queue } from "../queue";
import { TMessageActionModel, TMessageModel } from "../model/messageModel";
import { exit } from "process";

export type TQueueMessages = Queue<TMessageModel>;

const HELP_RE = /^(help)(\s+(\w+))?$/i;
const LOGOUT_RE = /^logout$/i;
const LOGIN_RE = /^login$/i;
const MANUAL_RE = /^manual$/i;
const HEALTH_RE = /^health$/i;
const CLEAR_RE = /^clear$/i;
const EXPLAIN_RE = /^explain\s(source)?$/i;
const TYPIFY_RE = /^typify\s(source)?$/i;

const HINT_1_RE = /^(hint_1)$/i;

const COMMAND_IN_MESSAGE = /\{command:([^\}]\w+)(\s+\b.*)?\}/i;

type TCommand = {
    command: string;
    regex: RegExp;
    commandId?: string;
    key?: string;
    caption?: string;
    alias?: string[];
    process?: (chat: ChatApi, ...args: any[]) => boolean;
}

const commandsMap: Record<string, TCommand> = {
    "help": {
        caption: "Help",
        command: "help",
        regex: HELP_RE,
        alias: ["h", "?"],
        process: (chat: ChatApi, command: string) => doHelp(chat, command)
    },
    "hint_1": {
        caption: "Dica",
        command: "hint_1",
        regex: HINT_1_RE,
        process: (chat: ChatApi, command: string) => doHelp(chat, "help hint_1")
    },
    "logout": {
        command: "logout",
        regex: LOGOUT_RE,
        alias: ["logoff", "exit", "bye"],
        commandId: "tds-dito.logout",
        process: (chat: ChatApi, command: string) => doLogout(chat)
    },
    "login": {
        command: "login",
        regex: LOGIN_RE,
        alias: ["logon", "hy", "hello"],
        commandId: "tds-dito.login",
    },
    "manual": {
        command: "manual",
        regex: MANUAL_RE,
        alias: ["man", "m"],
        commandId: "tds-dito.open-manual",
    },
    "health": {
        command: "health",
        regex: HEALTH_RE,
        alias: ["det", "d"],
        commandId: "tds-dito.health",
    },
    "clear": {
        caption: "Clear",
        command: "clear",
        regex: CLEAR_RE,
        alias: ["c"],
        process: (chat: ChatApi) => doClear(chat)
    },
    "explain": {
        command: "explain",
        regex: EXPLAIN_RE,
        alias: ["ex", "e"],
        commandId: "tds-dito.explain",
    },
    "typify": {
        command: "typify",
        regex: TYPIFY_RE,
        alias: ["ty", "t"],
        commandId: "tds-dito.typify",
    }
};

export function completeCommandsMap(extension: vscode.Extension<any>) {
    const commands: any = extension.packageJSON.contributes.commands;
    const keybindings: any = extension.packageJSON.contributes.keybindings;

    Object.keys(commands).forEach((key: string) => {
        const command: TCommand | undefined = ChatApi.getCommand(commands[key].command);

        if (command) {
            command.caption = command.caption || commands[key].shortTitle || commands[key].title;

            Object.keys(keybindings).forEach((key2: string) => {
                if (keybindings[key2].command == command.commandId) {
                    command.key = keybindings[key2].key;
                }
            });
        }
    });
}

export class ChatApi {
    // static getCommandsMap(): Record<string, TCommand> {
    //     return commandsMap;
    // }

    static getCommand(_command: string): TCommand | undefined {
        const commandId: string = _command.toLowerCase();
        let command: TCommand | undefined = commandsMap[commandId];

        if (!command) {
            Object.keys(commandsMap).forEach((key: string) => {
                if (commandsMap[key].commandId === commandId) {
                    command = commandsMap[key];
                    exit;
                }
            });
        }

        return command;
    }

    private queueMessages: TQueueMessages = new Queue<TMessageModel>();
    private messageGroup: boolean = false;
    private messageId: number = 0;

    /**
     * Eventos de notificação
     */
    private _onMessage = new vscode.EventEmitter<TQueueMessages>(); //novas mensagens

    /**
     * Subscrição para eventos de notificação
     */
    get onMessage(): vscode.Event<TQueueMessages> {
        return this._onMessage.event;
    }

    beginMessageGroup(): void {
        this.messageGroup = true;
    }

    endMessageGroup(): void {
        if (this.messageGroup) {
            this.messageGroup = false;
            this._onMessage.fire(this.queueMessages);
        }
    }

    protected sendMessage(message: TMessageModel): void {
        this.queueMessages.enqueue(message);

        if (!this.messageGroup) {
            this._onMessage.fire(this.queueMessages);
        }
    }

    async dito(message: string): Promise<void> {

        this.sendMessage({
            inProcess: true,
            messageId: this.messageId++,
            timeStamp: new Date(),
            author: "Dito",
            message: message,
            actions: this.extractActions(message)
        });
    }

    private extractActions(message: string): TMessageActionModel[] {
        let actions: TMessageActionModel[] = [];
        let matches = undefined;
        let workMessage: string = message;

        while (matches = workMessage.match(COMMAND_IN_MESSAGE)) {
            const commandId: string = matches[1];
            const command: TCommand | undefined = ChatApi.getCommand(commandId);

            if (command) {
                actions.push({
                    caption: command.caption || `<No caption>${command.command}`,
                    command: commandId
                });
            }

            workMessage = workMessage.replace(commandId, "");
        };

        return actions;
    }

    checkUser() {
        if (isDitoReady()) {
            if (!isDitoLogged()) {
                if (isDitoFirstUse()) {
                    this.dito(`Parece que é a primeira vez que nos encontramos. Quer saber como interagir comigo? ${this.commandText("hint_1")}`);
                }
                this.dito(`Para começar, preciso conhecer você. Favor identificar-se com o comando ${this.commandText('login')}.`);
            } else {
                this.dito(`Olá, ${getDitoUser()?.displayName}. Estou pronto para ajudá-lo no que for possível!`);
            }
        } else {
            vscode.commands.executeCommand("tds-dito.health");
        }
    }

    user(message: string, echo: boolean): void {
        if (echo) {
            this.beginMessageGroup();

            this.sendMessage({
                inProcess: false,
                messageId: this.messageId++,
                timeStamp: new Date(),
                author: getDitoUser()?.displayName || "Unknown",
                message: message == undefined ? "???" : message,
            });

            this.processMessage(message);

            this.endMessageGroup();
        } else {
            this.processMessage(message);
        }
    }

    commandList(): string {
        let commands: string[] = [];

        commands.push(`${this.commandText("help")}`);
        commands.push(`${this.commandText("manual")}`);
        commands.push(`${this.commandText("clear")}`);

        if (!isDitoReady()) {
            commands.push(`${this.commandText("details")}`);
        } else if (isDitoLogged()) {
            commands.push(`${this.commandText("logout")}`);
            commands.push(`${this.commandText("explain")}`);
            commands.push(`${this.commandText("typify")}`);
        } else {
            commands.push(`${this.commandText("login")}`);
        }

        return commands.join(", ");
    }

    commandText(_command: string, ...args: string[]): string {
        const command: TCommand | undefined = ChatApi.getCommand(_command);

        if (command) {
            return `[{command:${command.command}}${args ? args.join(" ") : ""}${command.key ? " ``" + command.key + "``" : ""}]`;
        }

        return _command;
    }

    private processMessage(message: string) {
        const command: TCommand | undefined = ChatApi.getCommand(message);

        if (command) {
            let processResult: boolean = true;

            if (command.process) {
                processResult = command.process(this, message);
            }

            if (processResult && command.commandId) {
                vscode.commands.executeCommand(command.commandId);
            } else {
                //this.dito(`Funcionalidade não implementada. Por favor, entre em contato com o desenvolvedor.`);
            }
        } else {
            this.dito(`Não entendi. Você pode digitar ${this.commandText("help")} para ver os comandos disponíveis.`);
        }
    }
}

function doHelp(chat: ChatApi, message: string): boolean {
    let matches = undefined;
    let result: boolean = false;

    if (matches = message.match(commandsMap["help"].regex)) {
        if (matches[2]) {
            if (matches[2].trim() == "hint_1") {
                chat.dito("Para interagir comigo, você usará comandos que podem ser acionados por um desses modos:");
                chat.dito("- Um atalho");
                chat.dito("- Pelo painel de comandos(``Ctrl+Shit-P`` ou ``F1``), filtrando por \"TDS-Dito\"");
                chat.dito("- Por uma ligação apresentada nesse bate-papo");
                chat.dito("- Digitando o comando no _prompt_ abaixo");
                chat.dito("- Menu de contexto do bate-papo ou fonte em edição.");
                chat.dito(`Para saber os comandos, digite ${chat.commandText("help")}.`);
            } else {
                chat.dito(`AJUDA DO COMANDO ${matches[2]}.`);
            }
        } else {
            chat.dito(`Os comandos disponíveis, no momento, são: ${chat.commandList()}.`);
            chat.dito(`Para informações mais específicas, digite ${chat.commandText("help")} seguido do comando desejado ou ${chat.commandText("manual")} para abrir a documentação mais detalhada.`);
        }

        result = true;
    }

    return result;
}

function doLogout(chat: ChatApi): boolean {

    chat.dito(`${getDitoUser()?.displayName}, até logo!`);
    chat.dito("Obrigado por usar o Dito!");
    chat.dito("Saindo...");

    return true;
}

function doClear(chat: ChatApi): any {
    chat.dito("Function not implemented.");
}
