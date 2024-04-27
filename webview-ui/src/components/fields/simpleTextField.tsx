/*
Copyright 2024 TOTVS S.A

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http: //www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
// import { useController, useFormContext } from "react-hook-form";
// import PopupMessage from "../popup-message";
// import { TdsFieldProps } from "../form";

// type TdsSimpleTextFieldProps = Omit<TdsFieldProps, "label">;

// /**
//  *
//  * - Uso de _hook_ ``useFieldArray`` e propriedade ``disabled``:
//  *   Por comportamento do _hook_, campos com ``disabled`` ativo não são armazenados
//  *   no _array_ associado ao _hook_.
//  *   Caso seja necessário sua manipulação, use ``readOnly`` como alternativa.
//  *
//  * @param props
//  *
//  * @returns
//  */
// export function TdsSimpleTextField(props: TdsSimpleTextFieldProps): JSX.Element {
// 	const {
// 		register,
// 		setValue,
// 		formState: { isDirty }
// 	} = useFormContext();
// 	const { field, fieldState } = useController(props);
// 	const registerField = register(props.name, props.rules);

// 	return (
// 		<section
// 			className={`tds-field-container tds-simple-text-field ${props.className ? props.className : ''}`}
// 		>
// 			<VSCodeTextField
// 				readOnly={props.readOnly || false}
// 				{...registerField}
// 			>
// 				<PopupMessage field={{ ...props, label: "" }} fieldState={fieldState} />
// 			</VSCodeTextField>
// 		</section>
// 	)
// }