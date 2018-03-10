# eSignature smart contract
# created by Eduards Marhelis @ANDIT Solutions
# Sign parameters:
# 	1. function "sign" String
# 	2. parameters Array()
#	-	Wallet address 
#	-	Document Hash sha256
#	-	Metadata Hash
#
# Verify parameters:
# 	1. function "signonly" String
# 	2. parameters ArrayWallet address 
#	- 	Wallet address
#	-	Document Hash sha256
#	-	Metadata Hash 
#
# commands
# build sc/signature.py test 07 01 False False sign ["aaa","bbb","ccc"]
# build sc/signature.py test 07 01 False False signonly ["aaa","bbb","ccc"]
# build sc/signature.py test 07 01 False False verify ["aaa","bbb","ccc"] #notused 
# build sc/signature.py test 07 01 False False gettx []  
# build sc/signature.py test 07 01 False False get ["aaa"]  
# build sc/signature.py test 07 01 False False store ["aaa","bbb","ccc"]
# build sc/signature.py test 07 01 False False getdoc ["aaa","bbb","ccc"]
# build sc/signature.py test 07 01 False False getdoctimestamp ["aaa","bbb","ccc"]
# build sc/signature.py test 07 01 False False getdockey ["aaa","bbb","ccc"]
# build sc/signature.py test 07 01 False False timestamp []
#
# import contract sc/signature.avm 0710 05 True False


# import libraries
from boa.blockchain.vm.Neo.Runtime import Log, Notify
from boa.blockchain.vm.Neo.Storage import GetContext, Get, Put, Delete
from boa.code.builtins import concat
from boa.code.builtins import sha1, sha256
from boa.blockchain.vm.Neo.Transaction import GetHash, GetUnspentCoins
from boa.blockchain.vm.System.ExecutionEngine import GetScriptContainer
from boa.blockchain.vm.Neo.Blockchain import GetHeight, GetHeader
from boa.blockchain.vm.Neo.Header import GetTimestamp, GetHash, GetNextConsensus  


def Main(action, parameters):
	Notify("eSignature contract invoked!")
	
	if action == 'sign':
		#validation here
		if len(parameters) == 3:
			#invoker address validation here
			#TODO
			address = parameters[0]
			document = parameters[1]
			metadata = parameters[2]
			return Sign(address, document, metadata)
		else:
			Log("Sign parameter count wrong!")	
			return False

	elif action == 'signonly':
		address = parameters[0]
		document = parameters[1]
		metadata = parameters[2]
		return SignOnly(address, document, metadata)

	elif action == 'verify':
		key = parameters[0]
		val = parameters[1]
		signature = parameters[2]
		return Verify(key,val,signature)
	
	elif action == 'gettx':
		return GetTransactionHash()

	elif action == "get":
		key = parameters[0]
		return GetKey(key)
		
	elif action == "store":
		address = parameters[0]
		document = parameters[1]
		metadata = parameters[2]
		koma = ","
		idConcat = concat(address,document)
		
		data = concat(address,koma)
		data2 = concat(data,document)
		data3 = concat(data2,koma)
		data4 = concat(data3,metadata)
		
		return StoreKey(idConcat,data4)	
	
	elif action == "getdoc":
		address = parameters[0]
		document = parameters[1]
		idConcat = concat(address,document)
		docKey = sha1(idConcat)
		return GetKey(docKey)
		
	elif action == "getdoctimestamp":
		address = parameters[0]
		document = parameters[1]
		metadata = parameters[2]
		dochash = SignOnly(address, document, metadata)
		docKey = sha1(dochash)
		return GetKey(docKey)
	
	elif action == "getdockey":
		address = parameters[0]
		document = parameters[1]
		idConcat = concat(address,document)
		docKey = sha1(idConcat)
		return docKey
	
	elif action == "timestamp":	
		return timestamp()

def Sign(address, document, metadata):
	idConcat = concat(address, document)
	docKey = sha1(idConcat)
	data = concat(docKey, metadata)
	
# 	tx = GetTransactionHash()
# 	data = concat(data, tx)
	
	hash = sha256(data)	
	if not checkIfKeyExists(docKey):
		StoreKey(docKey, hash)
		StoreTimestamp(hash)
		return hash
	return False

def SignOnly(address, document, metadata):
	idConcat = concat(address,document)
	docKey = sha1(idConcat)
	data = concat(docKey,metadata)
	
# 	tx = GetTransactionHash()
# 	data = concat(data, tx)

	hash = sha256(data)	
	return hash



def Verify(address,document,signature):
	idConcat = concat(address,document)
	docKey = sha1(idConcat)
	
	context = GetContext()
	exists = Get(context, docKey)
	if exists:
		Notify("Document found")
		if exists == signature:
			Notify("valid signature")
			return exists	
		else:
			Log("notfound",exists)
			return exists
			
	return False

def checkIfKeyExists(key):
	context = GetContext()
	exists = Get(context, key)
	if exists:
		Notify("KEY is already registered")
		return True			
	return False

# StoreKey stores key/value pair, before store cheks if there is this value
def StoreKey(key, value):
	msg = concat("StoreKey: ", key)
	Log(msg)
	
	#store value
	context = GetContext()
	exists = Get(context, key)
	if exists:
		Notify("KEY is already registered")
		return False

	Put(context, key, value)
	return key

# StoreTimestamp saves calculated hash sha1 key and then stores current blockchain timestamp
def StoreTimestamp(hash):
	ts = timestamp()
	key = sha1(hash)
	StoreKey(key, ts)
	return True


# GetKey returns value from
def GetKey(key):
	msg = concat("Get key: ", key)
	Log(msg)
	
	#get key
	context = GetContext()
	data = Get(context, key)
	msg = concat("Data found: ", data)
	Log(msg)
	return data


#get current transaction hash
def GetTransactionHash() -> str:
    transaction = GetScriptContainer()
    hash = GetHash(transaction)
    return hash


def timestamp():
	current_height = GetHeight()
# 	current_block = GetHeader(current_height)
# 	timestamp1 = current_block.Timestamp
# 	timestamp = concat(timestamp1,":")
# 	time = concat(timestamp,current_height)
# 	Log(time)
	return current_height
    
	
	




