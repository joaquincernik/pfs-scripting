# Documentación del Server Agent

Server agente escrito en Node.js que escucha en TCP y responde a comandos enviados por un cliente.
Protocolo de texto por líneas: el cliente envía comandos en una línea y el server responde con una
línea prefijada `>> SERVER:`.

## 1. Levantar el server

```bash
node tp2.js
```

Por defecto escucha en el puerto `7777`. Se puede cambiar con la variable de entorno:

```bash
PUERTO=9000 node tp2.js
```

## 2. Conectarse

El cliente se conecta por TCP, por ejemplo con telnet:

```bash
telnet 127.0.0.1 7777
```

Al conectarse, el server saluda pidiendo un token.

## 3. Autenticación

Todos los comandos (menos `token`) requieren haberse autenticado antes.

| Comando | Descripción |
| --- | --- |
| `token <token>` | Valida el token. Habilita el resto de los comandos. |

Los tokens válidos están en `tokens.txt` (separados por coma). Actualmente:

```
token123
abcdefgh
joaquin0
```

## 4. Formato del protocolo

- El cliente envía una línea de texto terminada en `\n`.
- El server responde `\n>> SERVER: <mensaje>\n`.
- Las respuestas de los comandos son **JSON** con esta forma:

```json
{
  "err": false,
  "command": "getosinfo",
  "content": []
}
```

- Los mensajes informativos (saludo, bienvenida, token inválido, comando no reconocido) son texto
  plano, no JSON.

Campos de la respuesta JSON:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `err` | boolean | `false` si el comando se ejecutó bien, `true` si hubo error. |
| `command` | string | Nombre del comando que se procesó. |
| `content` | any | Dato de respuesta específico de cada comando. |

## 5. Comandos

### `getosinfo [seconds]`

Devuelve las muestras de uso de CPU y memoria tomadas en los últimos `seconds` segundos (por
defecto `3600`).

- `content`: arreglo de muestras `{ cpu, mem, time }`.
- Cada muestra es:
  - `cpu`: objeto `{ user, system }` en microsegundos acumulados del proceso (`process.cpuUsage()`).
  - `mem`: objeto `{ rss, heapTotal, heapUsed, external, arrayBuffers }` en bytes (`process.memoryUsage()`).
  - `time`: timestamp en milisegundos.

El agente toma una muestra cada **30 segundos** y conserva hasta la **última hora**.

```text
token joaquin0
getosinfo 30
```

```json
>> SERVER: {"err":false,"command":"getosinfo","content":[{"cpu":{"user":3123512,"system":570041},"mem":{"rss":41394176,"heapTotal":21217280,"heapUsed":10970208,"external":44773,"arrayBuffers":0},"time":1788269961027}]}
```

### `watch <path> [time]`

Empieza a vigilar el directorio `path` durante `time` segundos (por defecto `60`, máximo `3600`).
Devuelve un **token de seguimiento** que se usa luego con `getwatches`.

- `content` (éxito): `{ "token": "..." }`.
- `content` (error): string con el motivo (ruta inválida o no es un directorio).
- Errores de uso: `"uso: watch <path> [time]"`.

Al vencer `time`, el watch se cierra y el token deja de existir.

```text
watch /home/joaquincernik/Desktop/pfs/magm/pf2026/3_tcp/tp2 120
```

```json
>> SERVER: {"err":false,"command":"watch","content":{"token":"63ca7b8e-5c1d-4f5a-9f63-2918c2b02f72"}}
```

### `getwatches <token>`

Consulta los eventos capturados por un watch y **vacía** la cola (lectura de tipo consumidor).

- `content` (éxito): arreglo de eventos.

Cada evento tiene la forma:

```json
{ "tipoEvento": "rename", "archivo": "/ruta/directorio/archivo", "tiempo": 1788269961027 }
```

| Campo | Descripción |
| --- | --- |
| `tipoEvento` | Evento nativo de `fs.watch`: `rename` (crear/borrar/mover) o `change` (modificar contenido). |
| `archivo` | Ruta completa del archivo afectado. |
| `tiempo` | Timestamp en milisegundos. |

Errores de uso: `"uso: getwatches <token>"` si falta el token, o `"token de seguimiento inválido"`
si el token no existe o ya expiró.

```text
getwatches 63ca7b8e-5c1d-4f5a-9f63-2918c2b02f72
```

```json
>> SERVER: {"err":false,"command":"getwatches","content":[{"tipoEvento":"rename","archivo":"/home/joaquincernik/Desktop/pfs/magm/pf2026/3_tcp/tp2/golaaa","tiempo":1788269961027}]}
```

### `ps`

Lista de procesos. Devuelve como `content` la salida cruda del comando `ps` del sistema.

```text
ps
```

```json
>> SERVER: {"err":false,"command":"ps","content":"    PID TTY          TIME CMD\n   4072 ?        00:00:00 systemd\n..."}
```

### `oscmd <comando y argumentos>`

Ejecuta un comando del sistema operativo y devuelve su salida.

- `content` (éxito): stdout del comando.
- `content` (error): mensaje de error del SO (ej. `"Command failed: <comando>"`).

Admite argumentos: `oscmd ls -a`, `oscmd touch archivo.txt`, etc.

```text
oscmd ls -a
```

```json
>> SERVER: {"err":false,"command":"oscmd","content":".\n..\ncomandos.mjs\n..."}
```

## 6. Sesión de ejemplo completa

```text
$ telnet 127.0.0.1 7777

>> SERVER: Hola, ingrese un token valido antes de comenzar a interactuar: token <token_valido>
token joaquin0

>> SERVER: Bienvenido, comandos disponibles
1-getosinfo <seconds>
2-watch <path> [time]
3-getwatches <token>
4-ps
5-oscmd <command>
getosinfo 30

>> SERVER: {"err":false,"command":"getosinfo","content":[{"cpu":{...},"mem":{...},"time":...}]}
watch /tmp 60

>> SERVER: {"err":false,"command":"watch","content":{"token":"63ca7b8e-..."}}
getwatches 63ca7b8e-...

>> SERVER: {"err":false,"command":"getwatches","content":[]}
ps

>> SERVER: {"err":false,"command":"ps","content":"    PID TTY ..."}
oscmd echo hola

>> SERVER: {"err":false,"command":"oscmd","content":"hola\n"}
```

## 7. Arquitectura de archivos

| Archivo | Rol |
| --- | --- |
| `tp2.js` | Server TCP: recibe líneas, autentica y enruta comandos. Usa `sendServer` para responder. |
| `comandos.mjs` | Implementación de cada comando (`getOsInfo`, `watch`, `getWatches`, `ps`, `oscmd`). |
| `dataCollector.mjs` | Toma muestras de CPU/memoria cada 30 s y las guarda (última hora). |
| `watcherManager.mjs` | Gestiona los `fs.watch()`, genera tokens de seguimiento y acumula eventos. |
| `tokens.txt` | Lista de tokens válidos (separados por coma). |

## 8. Limitaciones y pendientes

- **`quit`** todavía no está implementado: el server responde comando no reconocido. Para cortar,
  el cliente cierra la conexión.
- **Seguridad de `oscmd`**: en `comandos.mjs` está definida la lista `COMANDOS_PERMITIDOS`, pero por
  ahora **no se aplica**. `oscmd` ejecuta lo que se le pase (a través de `/bin/sh`). Antes de
  desplegar en un entorno real hay que habilitar la whitelist o restringir por IP remota, como pide
  la consigna.
- **Eventos de `watch`**: se reportan tal cual los da `fs.watch` (`rename`/`change`); no se
  distingue `new`/`delete`/`rename` explícitamente.