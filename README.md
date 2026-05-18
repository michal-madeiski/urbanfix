### Local/docker-compose.yml - zbudowanie baz lokalnych i mailhoga lokalnie (do testów z run z visuala - szybkie)
### UrbanFix/docker-compose.yml - zbudowanie aplikacji i połączenia z o2 (do testów z dockera - ostateczne rozwiązanie)
w .env zmiana providera o2 -> mailhog i odwrotnie (dla testów lokalnych taka zmiana w secrets.json w NotificationService)

### dla fronta folder na poziomie równym z UrbanFix i Local o nazwie np. UrbanFixUI i w jego środku implementacja fronta i docker-compose.yml dla fronta
