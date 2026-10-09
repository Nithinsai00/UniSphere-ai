Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""c:\Users\NITHIN\Downloads\kmpg\start_persistent_server.ps1""", 0, False
Set WshShell = Nothing
