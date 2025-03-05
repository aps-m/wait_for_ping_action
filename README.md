# wait_for_ping_action

Ожидание пинга от хоста

## Параметры

| Параметр | Описание                          | Тип    | Обязательный | Значение по умолчанию |
| -------- | --------------------------------- | ------ | ------------ | --------------------- |
| host     | Адрес/IP                          | Строка | Да           | localhost             |
| tries    | Количество попыток проверки пинга | Число  | Да           | 1                     |

## Пример использования

```yml
  - name: Wait for device to be pingable
    id: wait_for_ping
    uses: aps-m/wait_for_ping_action@main
    with:
        host: ${{ matrix.ip }}
        tries: 5

```
