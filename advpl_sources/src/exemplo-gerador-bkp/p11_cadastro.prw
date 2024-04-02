#include "protheus.ch"
#Include "FWMVCDef.ch"

// Montar tela para cadastro de clientes, usando MVC
// Montar tela para tabela SA1, usando MVC
// Montar uma Mod 1 para SA1, usando MVC

/*/{Protheus.doc} proc_01

Permite a manuten��o dos dados do cliente (SA1).

@author Alan Candido
/*/
user function P11_CADASTRO()
	//>>> opcional, mas recomendado para rotinas do usu�rio
	Local aArea   := GetArea()
	//<<<
	Local oBrowse

	//opcional
	dbSelectArea("SA1")

	oBrowse := FWMBrowse():New()
	oBrowse:SetAlias("SA1")
	oBrowse:SetDescription("Cadastro de Clientes")

	oBrowse:Activate()

	//>>> recomendado
	RestArea(aArea)
	//<<<
Return Nil

// static Function MenuDef()
// 	Local aRot := {}

// 	add option arotina title "VISUALIZAR" action "VIEWDEF.P1_CADASTRO" operation 2 access 0
// 	add option arotina title "INCLUIR"    action "VIEWDEF.P1_CADASTRO" operation 3 access 0
// 	add option arotina title "ALTERAR"    action "VIEWDEF.P1_CADASTRO" operation 4 access 0
// 	add option arotina title "EXCLUIR"    action "VIEWDEF.P1_CADASTRO" operation 5 access 0
// 	add option arotina title "IMPRIMIR"   action "VIEWDEF.P1_CADASTRO" operation 8 access 0
// 	add option arotina title "COPIAR"     action "VIEWDEF.P1_CADASTRO" operation 9 access 0

// Return aRot

// menu CRUD "autom�tico"
static Function MenuDef()
return FWMVCMenu("P11_CADASTRO")

	// defini��o do modelo
static Function ModelDef()
	Local oModel := Nil
	Local oStSA1 := FWFormStruct(1, "SA1")

	oModel := MPFormModel():New("P11_CADASTRO",/*bPre*/, /*bPos*/,/*bCommit*/,/*bCancel*/)
	oModel:AddFields("FORMSA1",/*cOwner*/,oStSA1)
	oModel:SetPrimaryKey({"A1_FILIAL","A1_CODIGO"})
	oModel:SetDescription("Cadastro de Clientes")
	oModel:GetModel("FORMSA1"):SetDescription("Formul�rio do Cadastro Cliente")

Return oModel

// defini��o da vis�o
Static Function ViewDef()
	Local oModel := FWLoadModel("P11_CADASTRO")
	Local oStSA1 := FWFormStruct(2, "SA1")  //pode se usar um terceiro par�metro para filtrar os campos exibidos { |cCampo| cCampo $ "SA1_NOME|SA1_DTAFAL|"}
	Local oView := Nil

	oView := FWFormView():New()
	oView:SetModel(oModel)
	oView:AddField("VIEW_SA1", oStSA1, "FORMSA1")
	oView:CreateHorizontalBox("TELA",100)
	oView:EnableTitleView("VIEW_SA1", "Clientes" )
	oView:SetCloseOnOk({||.T.})
	oView:SetOwnerView("VIEW_SA1","TELA")

Return oView
