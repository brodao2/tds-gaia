
// basico: Crie uma func�o de usu�rio que execute a fun��o Pergunte
// basico: Me de um exemplo mostrando o uso da fun��o Pergunte

user function fncPergunte()
	Private cPerg1    := "QER051"

    RPCSetEnv("T1", "D MG 01","admin", "1234")

	Pergunte(cPerg1,.T.)
	conout("Pergunte executada")
return
