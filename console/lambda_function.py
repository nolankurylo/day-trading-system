import time
import json
import requests
import os

def command_breakdown(params):
    cmd = params[0]
    other_params = params[1:]
    if cmd == 'ADD':
        endpoint_url = 'http://ec2-15-222-26-11.ca-central-1.compute.amazonaws.com/console_test'
        body = json.dumps({
            'command': cmd,
            'params' : json.dumps(other_params)
        })
        r = requests.post(endpoint_url, params=body)
        return r.text
    elif cmd == 'QUOTE':
        return ("Send QUOTE Here with: " + str(other_params))
    elif cmd == 'BUY':
        return ("Send BUY Here with: " + str(other_params))
    elif cmd == 'COMMIT_BUY':
        return ("Send COMMIT_BUY Here with: " + str(other_params))
    elif cmd == 'CANCEL_BUY':
        return ("Send CANCEL_BUY Here with: " + str(other_params))
    elif cmd == 'SELL':
        return ("Send SELL Here with: " + str(other_params))
    elif cmd == 'COMMIT_SELL':
        return ("Send COMMIT_SELL Here with: " + str(other_params))
    elif cmd == 'CANCEL_SELL':
        return ("Send CANCEL_SELL Here with: " + str(other_params))
    elif cmd == 'SET_BUY_AMOUNT':
        return ("Send SET_BUY_AMOUNT Here with: " + str(other_params))
    elif cmd == 'CANCEL_SET_BUY':
        return ("Send CANCEL_SET_BUY Here with: " + str(other_params))
    elif cmd == 'SET_BUY_TRIGGER':
        return ("Send SET_BUY_TRIGGER Here with: " + str(other_params))
    elif cmd == 'SET_SELL_AMOUNT':
        return ("Send SET_SELL_AMOUNT Here with: " + str(other_params))
    elif cmd == 'SET_SELL_TRIGGER':
        return ("Send SET_SELL_TRIGGER Here with: " + str(other_params))
    elif cmd == 'CANCEL_SET_SELL':
        return ("Send CANCEL_SET_SELL Here with: " + str(other_params))
    elif cmd == 'DUMPLOG' and len(other_params) > 1:
        return ("Send DUMPLOG USER Here with: " + str(other_params))
    elif cmd == 'DUMPLOG':
        return ("Send DUMPLOG Here with: " + str(other_params))
    elif cmd == 'DISPLAY_SUMMARY':
        return ("Send DISPLAY_SUMMARY Here with: " + str(other_params))


###################### MAIN ######################

# Run this file with python3 console.py workload/{filename}

def lambda_handler(event, context): 
    start = time.perf_counter()

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
