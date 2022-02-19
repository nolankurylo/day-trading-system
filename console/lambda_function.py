import time
import json
import requests
import os


API_URL = 'http://ec2-15-222-26-11.ca-central-1.compute.amazonaws.com'

def command_breakdown(params):

    cmd = params[0]
    args  = params[1:]

    if cmd == 'ADD':

        userid = args[0]
        amount = args[1]

        body = json.dumps({
            'userid' : userid,
            'amount' : amount
        })

        URL = API_URL + '/add'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'QUOTE':

        userid = args[0]
        stockSymbol = args[1]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol
        })

        URL = API_URL + '/quote'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'BUY':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol,
            'amount': amount
        })

        URL = API_URL + '/buy'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'COMMIT_BUY':

        userid = args[0]
        
        body = json.dumps({
            'userid' : userid
            
        })

        URL = API_URL + '/commit_buy'
        
        r = requests.post(URL, params=body)
        return (r.json())

    elif cmd == 'CANCEL_BUY':
        userid = args[0]

        body = json.dumps({
            'userid' : userid
            
        })

        URL = API_URL + '/cancel_buy'

        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'SELL':
        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol,
            'amount': amount
        })

        URL = API_URL + '/sell'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'COMMIT_SELL':
        userid = args[0]

        body = json.dumps({
            'userid' : userid
            
        })

        URL = API_URL + '/commit_sell'

        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'CANCEL_SELL':

        userid = args[0]

        body = json.dumps({
            'userid' : userid
            
        })

        URL = API_URL + '/cancel_sell'

        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'SET_BUY_AMOUNT':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol,
            'amount': amount
        })

        URL = API_URL + '/set_buy_amount'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'CANCEL_SET_BUY':

        userid = args[0]
        amount = args[1]

        body = json.dumps({
            'userid' : userid,
            'amount': amount
        })

        URL = API_URL + '/cancel_set_buy'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'SET_BUY_TRIGGER':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol,
            'amount': amount
        })

        URL = API_URL + '/set_buy_trigger'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'SET_SELL_AMOUNT':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol,
            'amount': amount
        })

        URL = API_URL + '/set_sell_amount'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'SET_SELL_TRIGGER':

        userid = args[0]
        stockSymbol = args[1]
        amount = args[2]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol,
            'amount': amount
        })

        URL = API_URL + '/set_sell_trigger'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'CANCEL_SET_SELL':

        userid = args[0]
        stockSymbol = args[1]

        body = json.dumps({
            'userid' : userid,
            'stockSymbol' : stockSymbol
        })

        URL = API_URL + '/cancel_set_sell'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'DUMPLOG' and len(args) > 1:

        userid = args[0]
        filename = args[1]
        
        body = json.dumps({
            'userid' : userid,
            'filename' : filename
        })

        URL = API_URL + '/dumplog'
        
        r = requests.post(URL, params=body)

        return (r.json())

    elif cmd == 'DUMPLOG':

        filename = args[0]
        
        body = json.dumps({
            'filename' : filename
        })

        URL = API_URL + '/dumplog'
        
        r = requests.post(URL, params=body)

        return (r.json())
        
    elif cmd == 'DISPLAY_SUMMARY':

        userid = args[0]
        
        body = json.dumps({
            'userid' : userid
        })

        URL = API_URL + '/dumplog'
        
        r = requests.post(URL, params=body)

        return (r.json())


###################### MAIN ######################

# Run this file with python3 lambda_function.py workload/{filename}

def lambda_handler(event, context): 
    start = time.perf_counter()
    print(start)

    file_name = event['file_path']

    workload_file = open(file_name, 'r')
    
    contents = workload_file.read()
    command_list = contents.splitlines()
    
    output = ''

    for command in command_list:
        index,cmd_string = command.split()
        params = cmd_string.split(',')
        output += command_breakdown(params)

    end = time.perf_counter()

    return {
        'statusCode': 200,
        'body': json.dumps(output)
    }
