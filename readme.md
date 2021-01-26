If you want access to all of this tools command you need to exclude your username on index js validation case

!find : 
  description: mencari member yang terdapat di github dengan role tertentu dan membuat 7 file JSON dengan isi 
  member yang valid (ada di discord dan ada di spreadsheet), invalid (ada di discord tak ada di spreadsheet), passed,fail,repeat,withdraw,cuti
  param 1: "phase murid" (p0 || p1 || p2)

!validate:
  description: WARNING , validate hanya bisa dijalankan ketika find telah dijalankan untuk phase terkait.
  membandingan member yang ada di JSON hasil failed/repeat/passed dengan yang ada di spreadsheet untuk menemukan anomali data.
  param 1: "phase murid" (p0 || p1 || p2)
  param 2: "status murid" (failed || passed || repeat)

!graduate:
  description: membuat siswa dengan role student-phase3 menjadi student-alumni

!kick:
  description: WARNING ACTION CANNOT BE UNDO, tendang berfungsi untuk mengeluarkan orang dari channel dengan role yang sudah di sebutkan di param
  param 1: (alumni || invalid)
  param 2: Hanya bisa dipakai jika param 1 invalid, berisi phase (p0 || p1 || p2)

!execute:
  description: WARNING ACTION CANNOT BE UNDO, tolong cross check dulu sebelum eksekusi command ini dengan find dan validate, execute berfungsi untuk menaikan phase role murid / mengeluarkan murid dari discord tergantung dari param yg diberikan
  param 1: (p0 || p1 || p2 || student-new)
  param 2: (failed || passed) *student-new wajib menggunakan param "passed" *failed itu maksudnya yg mau di kick, repeat bukan failed
