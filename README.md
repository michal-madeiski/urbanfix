### Local/docker-compose.yml - zbudowanie baz lokalnych i mailhoga lokalnie (do testów z run z visuala - szybkie)
### UrbanFix/docker-compose.yml - zbudowanie aplikacji i połączenia z o2 (do testów z dockera - ostateczne rozwiązanie)
w .env zmiana providera o2 -> mailhog i odwrotnie (dla testów lokalnych taka zmiana w secrets.json w NotificationService)

### dla fronta folder na poziomie równym z UrbanFix i Local o nazwie np. UrbanFixUI i w jego środku implementacja fronta i docker-compose.yml dla fronta

## Inne ważne:
1) plik .env do folderu UrbanFix (ma być UrbanFix/.env)
2) pliki secrets: prawym na projekt mikroserwisu -> zarządzaj sekretami użytkownika -> wklejasz kod z odpowiedniego pliku
3) do testów lokalnych: konfiguruj projekty startowe -> wiele projektów startowych -> wszystko oprócz Common na "Uruchom"
4) do testów lokalnych musisz odpalić kontener mailhog (wewnętarz kontenera urbanfix - sam mailhog bez tego od baz danych)
5) do testów z aws db odpalasz cały kontener urbanfix-app i wtedy są też prawdziwe maile
6) jak jest nowa sesja na aws learner lab to passy wklejasz do .env i do secrets.json w ReportService
