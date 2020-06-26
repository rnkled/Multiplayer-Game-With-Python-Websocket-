import asyncio
import websockets
import json
import pprint

players = 1
data = {}
connected = set()
arena = 0


def addPlayer(info):
    # Adiciona Player no Info
    # print('faddplayer')
    data[info['id']] = info['pos']


def get_data():
    # Retorna os dados atualizados para o envio
    # print('fgetData')
    if bool(data):
        return json.dumps(data)


async def update_clients():
    # Roda a Rotina pra notificar todos os Conectados
    global data
    if connected and data:
        message = get_data()
        await asyncio.wait([user.send(message) for user in connected])


async def reset_clients(newArena):
    # Roda a Rotina pra resetar todos os Conectados
    global data
    if connected and data:
        message = "reset"
        await asyncio.wait([user.send(message) for user in connected])
        await asyncio.wait([user.send(newArena) for user in connected])


async def unregister(websocket):
    # Remove uma conexão da lista
    # print('funregister')
    connected.remove(websocket)
    await update_clients()


async def register(websocket):
    # adiciona uma conexão na lista
    # print('fregister')
    connected.add(websocket)
    await update_clients()


async def client_handler(websocket, path):
    global players
    global data
    global arena
    await register(websocket)
    try:
        async for message in websocket:
            new_data = message
            if 'hello' in new_data:
                if arena == 0:
                    converted_data = json.loads(new_data)
                    arena = converted_data['Arena']
                    await websocket.send('your_id: '+str(players))
                else:
                    await websocket.send('your_id: '+str(players))
                    await websocket.send('{"Arena":'+json.dumps(arena)+'}')
                if len(connected) <= 1:
                    await websocket.send('host')
                print(f"[Server] Nova Conexão Atribuida ID: {players}")
                players += 1
            elif 'update' in new_data:
                data['Action'] = 'Update'
                converted_data = json.loads(new_data)
                data[list(converted_data['Data'])[0]] = converted_data['Data']
                data['Bullets'] = converted_data['Bullets']
                # pprint.pprint(data['Bullets'])
                await update_clients()
            elif 'reset' in new_data:
                converted_data = json.loads(new_data)
                arena = converted_data['Arena']
                newArena = '{"Arena":'+json.dumps(arena)+'}'
                await reset_clients(newArena)

    finally:
        await unregister(websocket)
        data = {}
        print('[Server] Usuario Desconectado')


print('[Server] Servidor Iniciado.')
start_server = websockets.serve(client_handler, "localhost", 80)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
