#include "protheus.ch"

// gerar di�logo solicitando usu�rio e senha
user function dlglogin()
	local oDlg
	local oButton1
	local oGet1
	local oGet2
	local oSay1
	local oSay2
	local cName := space(10) //tem que reservar "espa�o"
	local cPassword := space(10)

	define msdialog oDlg title "Login" from 000, 000 to 300, 500 pixel //oDlg := MSDialog()....

	@ 038, 065 say oSay1 prompt "Nome" size 049, 007 of oDlg  pixel //oSay1 := TSay()....
	@ 048, 065 get oGet1 var cName size 060, 010 of oDlg pixel //oGet1 := TGet()....

	@ 075, 065 say oSay2 prompt "Senha" size 049, 007 of oDlg  pixel
	@ 085, 065 get oGet2 var cPassword size 060, 010 of oDlg pixel

	@ 105, 065 button oButton1 prompt "OK" of oDlg action {|| oDlg:end() } size 36,11 pixel // oButton1 := TButton()....

	activate msdialog oDlg centered

	//adicione o seu c�digo
	if trim(cPassword) == "1234"
		msgalert(cName + ", senha correta", "ok")
	else
		msgalert(cName + ", senha incorreta. Tente 1234", "Erro")
	endif

return
