import time
import json
import requests
import os


API_URL = 'http://localhost:3000'

def command_breakdown(params):

    cmd = params[0]
    args  = params[1:]

    if cmd == 'ADD':

        userid = args[0]
        amount = args[1]

        body = {
            'userid' : userid,
            'amount' : amount
        }

        URL = API_URL + '/add'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'QUOTE':

        userid = args[0]
        stockSymbol = args[1]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol
        }

        URL = API_URL + '/quote'
        
        r = requests.get(URL, json=body)
        print(r.text)

        

    elif cmd == 'BUY':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol,
            'amount': amount
        }

        URL = API_URL + '/buy'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'COMMIT_BUY':

        userid = args[0]
        
        body = {
            'userid' : userid
        }

        URL = API_URL + '/commit_buy'
        
        r = requests.post(URL, json=body)
        print(r.text)
        

    elif cmd == 'CANCEL_BUY':
        userid = args[0]

        body = {
            'userid' : userid
        }

        URL = API_URL + '/cancel_buy'

        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'SELL':
        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol,
            'amount': amount
        }

        URL = API_URL + '/sell'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'COMMIT_SELL':
        userid = args[0]

        body = {
            'userid' : userid   
        }

        URL = API_URL + '/commit_sell'

        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'CANCEL_SELL':

        userid = args[0]

        body = {
            'userid' : userid   
        }

        URL = API_URL + '/cancel_sell'

        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'SET_BUY_AMOUNT':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol,
            'amount': amount
        }

        URL = API_URL + '/set_buy_amount'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'CANCEL_SET_BUY':

        userid = args[0]
        stockSymbol = args[1]

        body = {
            'userid' : userid,
            'StockSymbol': stockSymbol
        }

        URL = API_URL + '/cancel_set_buy'
        
        r = requests.post(URL, json=body)
        print(r.text)
        

    elif cmd == 'SET_BUY_TRIGGER':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol,
            'amount': amount
        }

        URL = API_URL + '/set_buy_trigger'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'SET_SELL_AMOUNT':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol,
            'amount': amount
        }

        URL = API_URL + '/set_sell_amount'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'SET_SELL_TRIGGER':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol,
            'amount': amount
        }

        URL = API_URL + '/set_sell_trigger'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'CANCEL_SET_SELL':

        userid = args[0]
        stockSymbol = args[1]

        body = {
            'userid' : userid,
            'StockSymbol' : stockSymbol
        }

        URL = API_URL + '/cancel_set_sell'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'DUMPLOG' and len(args) > 1:

        userid = args[0]
        filename = args[1]
        
        body = {
            'userid' : userid,
            'filename' : filename
        }

        URL = API_URL + '/user_dumplog'
        
        r = requests.post(URL, json=body)
        print(r.text)

        

    elif cmd == 'DUMPLOG':

        filename = args[0]
        
        body = {
            'filename' : filename
        }

        URL = API_URL + '/dumplog'
        
        r = requests.post(URL, json=body)
        print(r.text)

        
        
    elif cmd == 'DISPLAY_SUMMARY':

        userid = args[0]
        
        body = {
            'userid' : userid
        }

        URL = API_URL + '/display_summary'
        
        r = requests.post(URL, json=body)
        print(r.text)

        


###################### MAIN ######################

# Run this file with python3 lambda_function.py workload/{filename}

def lambda_handler(): 
    start = time.perf_counter()

    file_name = "workloads/1add.txt"

    workload_file = open(file_name, 'r')
    
    contents = workload_file.read()
    command_list = contents.splitlines()
    

    for command in command_list:
        index,cmd_string = command.split()
        params = cmd_string.split(',')
        output = command_breakdown(params)

    end = time.perf_counter()

    return {
        'statusCode': 200,
        'body': json.dumps(output)
    }

lambda_handler()