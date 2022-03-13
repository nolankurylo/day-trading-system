import time
import json
import requests
import os
from requests.sessions import Session
from threading import local
from concurrent.futures import ThreadPoolExecutor

API_URL = 'http://ec2-15-222-26-11.ca-central-1.compute.amazonaws.com'

def send_request(transaction_num, params, session):

    cmd = params[0]
    args  = params[1:]

    if cmd == 'ADD':

        userid = args[0]
        amount = args[1]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'amount' : float(amount)
        }

        URL = API_URL + '/add'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'QUOTE':

        userid = args[0]
        stockSymbol = args[1]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol
        }

        URL = API_URL + '/quote'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'BUY':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol,
            'amount': float(amount)
        }

        URL = API_URL + '/buy'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'COMMIT_BUY':

        userid = args[0]
        
        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
        }

        URL = API_URL + '/commit_buy'
        
        r = requests.post(URL, json=body)
        

    elif cmd == 'CANCEL_BUY':
        userid = args[0]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
        }

        URL = API_URL + '/cancel_buy'

        r = requests.post(URL, json=body)

        

    elif cmd == 'SELL':
        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol,
            'amount': float(amount)
        }

        URL = API_URL + '/sell'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'COMMIT_SELL':
        userid = args[0]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,   
        }

        URL = API_URL + '/commit_sell'

        r = requests.post(URL, json=body)

        

    elif cmd == 'CANCEL_SELL':

        userid = args[0]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,   
        }

        URL = API_URL + '/cancel_sell'

        r = requests.post(URL, json=body)

        

    elif cmd == 'SET_BUY_AMOUNT':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol,
            'amount': float(amount)
        }

        URL = API_URL + '/set_buy_amount'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'CANCEL_SET_BUY':

        userid = args[0]
        stockSymbol = args[1]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol': stockSymbol
        }

        URL = API_URL + '/cancel_set_buy'
        
        r = requests.post(URL, json=body)
        

    elif cmd == 'SET_BUY_TRIGGER':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol,
            'amount': float(amount)
        }

        URL = API_URL + '/set_buy_trigger'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'SET_SELL_AMOUNT':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol,
            'amount': float(amount)
        }

        URL = API_URL + '/set_sell_amount'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'SET_SELL_TRIGGER':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol,
            'amount': float(amount)
        }

        URL = API_URL + '/set_sell_trigger'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'CANCEL_SET_SELL':

        userid = args[0]
        stockSymbol = args[1]

        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'StockSymbol' : stockSymbol
        }

        URL = API_URL + '/cancel_set_sell'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'DUMPLOG' and len(args) > 1:

        userid = args[0]
        filename = args[1]
        
        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
            'filename' : filename
        }

        URL = API_URL + '/user_dumplog'
        
        r = requests.post(URL, json=body)

        

    elif cmd == 'DUMPLOG':

        filename = args[0]
        
        body = {
            'filename' : filename,
            'nextTransactionNum': transaction_num
        }

        URL = API_URL + '/dumplog'
        
        r = requests.post(URL, json=body)

        
        
    elif cmd == 'DISPLAY_SUMMARY':

        userid = args[0]
        
        body = {
            'userid' : userid,
            'nextTransactionNum': transaction_num,
        }

        URL = API_URL + '/display_summary'
        
        r = requests.post(URL, json=body)   

thread_local = local()

def get_session() -> Session:
    if not hasattr(thread_local,'session'):
        thread_local.session = requests.Session()
    return thread_local.session

def process_users_commands(command_list):
    session = get_session()
    for command in command_list:
        index,cmd_string = command.split()
        params = cmd_string.split(',')
        send_request(int(index.strip('[]')),params,session)

###################### MAIN ######################

# Run this file with python3 lambda_function.py workload/{filename}

def lambda_handler(event, context): 
    start = time.perf_counter()

    file_name = event['file_path']

    workload_file = open(file_name, 'r')
    
    contents = workload_file.read()
    command_list = contents.splitlines()
    

    users_commands = {}
    for command in command_list[:-1]:
        index, cmd_string = command.split()
        params = cmd_string.split(',')
        user = params[1]
        if user not in users_commands:
            users_commands[user] = [command]
        else:
            users_commands[user].append(command)


    only_cmds = []
    for user,cmds in users_commands.items():
        # For each user give it a thread 
        only_cmds.append(cmds)
    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(process_users_commands,only_cmds)

    #do dumplog last
    process_users_commands([command_list[-1]])
    end = time.perf_counter()
    
    return {
        'statusCode': 200,
        'body': json.dumps('Total Time: ' + str(end - start))
    }

