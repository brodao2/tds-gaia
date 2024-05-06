#include "protheus.ch"
#Include "FWMVCDef.ch"

// basico: Montar um browse para a tabela de produtos
// complementar: Utilizar a chamada da fun��o mbrowse() passando como par�metro a tabela SB1 para montar o browse
// basico: Montar um browse para a tabela SB1 utilizando a fun��o mbrowse()
user function proc_01()
	Local aArea   := GetArea()
	dbSelectArea("SB1")
	mBrowse("SB1")
	RestArea(aArea)

Return(.T.)

// basico: Montar um browse para a tabela de produtos usando MVC
// basico: Montar um browse para a SB1 usando MVC
// basico: Criar uma tela usando a tabela de produtos SB1 e usando MVC
user function proc_02()
	Local aArea   := GetArea()
	Local oBrowse

	dbSelectArea("SB1")

	oBrowse := FWMBrowse():New()
	oBrowse:SetAlias("SB1")
	oBrowse:SetDescription("Cadastro de Produtos")

	oBrowse:Activate()

	RestArea(aArea)
Return Nil

