![Screen Shot 2018-03-09 at 19.50.44.png](resources/05D7C23517B91E99CC6573AC1CAFA9B3.png)

---

### Online demo

Online demo can be viewed at [http://esignature.network](http://esignature.network/)

Source code - <https://github.com/ANDIT-Solutions/neo-esignature>

---

![Screen Shot 2018-03-10 at 14.25.23.png](resources/10871A3FED9FD6A9E106929C497F1241.png)

---

### Idea

**Identity** is big part of NEO Smart economy, and for **digital identity online **electronic document signing is big part of it.

**Blockchain** has been around 10 years now and providing option to store something online that no single entity can remove is ideal solution to prove digital document creation.

To prove that I created document at specific time I don’t need to store all file in blockchain all i need is to store file hash. But it’s not enough, we need prove time when I created this document, that’s why we need to store this document in blockchain. When we store it, it is stored at specific block height at blockchain. Each block has known time when it was created and information.

### Use cases

* Designer came up with new Logo idea, hi then signed this logo image online.
* Engineer created new formula for efficient rocket fuel, he created digital document and signed this document online with his NEO wallet.
* Developer came up with groundbreaking storage algorithm, he signed code library online.
* Payment provider signs his incoming payments online automatically, so he can prove that these are the amounts he have processed and transactions are not tampered with.
* System sign important event logs online, so owner can prove them later that there was no tampering with logs.

### What is eSignature.network?

**eSignature** is tool that provides option for you to attach your online identity to digital documents.

By combining NEO identity with NEO smart contract esignature.network provides tool for fast and easy way to sign and verify digital document online.

NEO identity (Wallet) + Timestamp (smart contract) = eSignature

![](resources/9FBEE3D4C997A159F574DA394B37DAA6.jpg)

**Safety** - Safety of blockchain means no one can delete or change this information. Documents are signed only and there is no private information available about documents. Your secrets are safe.

**
**

![](resources/E4FFEA045B570BECA8FB74F53B01AE63.jpg)

**Mobility** - No papers means its easy to store lot of documents digitally. Digital identity and document availability are global.

**
**

![](resources/690C42D23576A3E542D321D68C458FC3.jpg)

**Green** - No papers for document signing.

**
**

![](resources/C5B6E2596538B248B4B7DA306A24E228.jpg)

**Ease of usage** - It is easy to use form, signing up, no tokens, upload document, verify and downlaod signature file.

**
**

![](resources/045E0468E7E784D3D12BB2CF86270273.jpg)

**Affordable and fast** - Its cost only 0.001 gas ($0.025) to digitally sign document, thats x25 times cheaper than in Latvian (LV) e-signature service.

### Technical process overview

---

![NEO eSignature .png](resources/5D2701C639EA6D67E655725A1A5D259B.png)

---

### What happens in smart contract?

User sends invocation with parameters from his wallet.

Smart contracts creates hash from these parameters and store it in blockchain together with current block height.

Signing function:

```python
def Sign(address, document, metadata):
  #cteate key id from address and document hash
	idConcat = concat(address, document)
	docKey = sha1(idConcat)
	#create hash from all parameters
	data = concat(docKey, metadata)
	hash = sha256(data)	
	#check if there is document with this key already stored
	if not checkIfKeyExists(docKey):
	  #store document hash
		StoreKey(docKey, hash) 
		#store document timestamp
		StoreTimestamp(hash)
		return hash
	return False
```

```python
Verification functions:

#function SignOnly
def SignOnly(address, document, metadata):
  #cteate key id from address and document hash
	idConcat = concat(address,document)
	docKey = sha1(idConcat)
	#create hash from all parameters
	data = concat(docKey,metadata)
	hash = sha256(data)	
	#return hash for verification
	return hash
	
#operation getdoctimestamp	
elif action == "getdoctimestamp":
	address = parameters[0]
	document = parameters[1]
	metadata = parameters[2]
	dochash = SignOnly(address, document, metadata)
	docKey = sha1(dochash)
	return GetKey(docKey)
```

### Step 1 - Upload document and fill web form

![Screen Shot 2018-03-10 at 13.44.27.png](resources/823EB4949BBA92C21C355D647C6383C3.png)

### Step 2 - Invoke smart contract with parameters generated in application

![Screen Shot 2018-03-10 at 14.13.53.png](resources/E9461429B0CB8E2AAA8E56C95F1F83A8.png)

### Step 3 - Wait while application detects your invoke and download document signature file

![Screen Shot 2018-03-10 at 13.48.23.png](resources/5C72AB5856C75E678B46B7F833987690.png)

### Step 4 - To verify document uplaod original file and signature to verify form.

![image.png](resources/3A1410D41A482EF3F351D29B980A3815.png)

### Step 5 - If document was not the same as original file, signature verification will fail.

![image(1).png](resources/716DA20D5C2F270C10E0ECDE91E6C8FB.png)



### How to invoke smart contract from NEO-GUI

![image1.png](resources/C6E938CD1BD0E326946875B8BC368B97.png)

![image2.png](resources/AA1E40D59E80BFBB4CC500A4A038C19E.png)

![image3.png](resources/52ECAC1DD8B3DF2A57503A13952EE67C.png)

![image4.png](resources/B9690BEECCC64274D8E736E83972723B.png)

![image5.png](resources/BBDC042941FDC48A1E75379F18F22D5D.png)

![image6.png](resources/1400085AEA00CD5BEA1F2DC6758F6AD3.png)

### Requesting document timestamp proof through NEO rpc-api

This is how other persons can verify document not using our created web tool, this is important for decentralised applications.

**getdoctimestamp** - function that queries blockchain and get requested document timestamp, if any of parameters would be different output would be empty.

**value = 1404** - this is block height this document was signed.

Request:

```json
{
  "jsonrpc": "2.0",
  "method": "invoke",
  "params": [
    "3196c8523664004204c506cb27ccf9022bc4878c",
    [
      {
        "type": "String",
        "value": "getdoctimestamp"
      },
      {
        "type": "Array",
        "value": [
          {
            "type": "ByteArray",
            "value": "0ff0264fe001bc65624aa5333dbcf903b60856b8"
          },
          {
            "type": "ByteArray",
            "value": "e6604b6cfc82e437aa43efd0a61797d3fde0d239cd8fa746b6e04435f77848b3"
          },
          {
            "type": "ByteArray",
            "value": "7e3975e060bc507e1015ae0eae647497e7290a8c4d7ed0ff9b8f7c45794839ea"
          }
        ]
      }
    ]
  ],
  "id": 1
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "script": "207e3975e060bc507e1015ae0eae647497e7290a8c4d7ed0ff9b8f7c45794839ea20e6604b6cfc82e437aa43efd0a61797d3fde0d239cd8fa746b6e04435f77848b3140ff0264fe001bc65624aa5333dbcf903b60856b853c10f676574646f6374696d657374616d70678c87c42b02f9cc27cb06c5044200643652c89631",
    "state": "HALT, BREAK",
    "gas_consumed": "0.405",
    "stack": [
      {
        "type": "ByteArray",
        "value": "1404"
      }
    ],
    "tx": "d1017e207e3975e060bc507e1015ae0eae647497e7290a8c4d7ed0ff9b8f7c45794839ea20e6604b6cfc82e437aa43efd0a61797d3fde0d239cd8fa746b6e04435f77848b3140ff0264fe001bc65624aa5333dbcf903b60856b853c10f676574646f6374696d657374616d70678c87c42b02f9cc27cb06c5044200643652c89631000000000000000000000000"
  }
}
```

### Signature file format

```json
{
   "key": "f489a6e8e0c680127f4abc3c4f19ffc89493239e",
   "addressScriptHash": "1d76e3a6d1b5698a9395a025245b5dc2afa8fe61",
   "contractScriptHash": "3196c8523664004204c506cb27ccf9022bc4878c",
   "signatureHash": "62ac56265247453a74ece9e4a6ac9f98e46a301614529ab9797a7b6072d788bb",
   "fileHash": "f65412cb711a6e91a597da118cceb552081aa7d1f0c9091c5e760fa94c9ed6fd",
   "metaDataHash": "adee37b20de2e31608b35e084aa7daa40df938de32ef142324cf9b815a4b6af6",
   "docHash": "90b06ed07bf18204561621e35064f08e3079718e5c3621daa38874995c2bbfa2",
   "metaData": {
       "title": "Title",
       "description": "this is my description",
       "firstname": "Johny",
       "lastname": "Bravo"
   },
   "timestamp": 1456
}
```

### Technology used for this project

* Angular.js
* Node.js
* Neon-js
* Python Boa
* Neo-python

### Future vision

Since NEO Auth and NEO identity still is under heavy development there is lot of room for improvements.

1\. eSignature project should be integrated with NeaAuth for correct address identification.

2\. We would suggest for future to create NEO link standart for browser plugins where you can send parameters to wallet, and you can invoke contracts very easy.

Example:

`neoinvoke:3196c8523664004204c506cb27ccf9022bc4878c?param1=functionname&param2=hexstring&gas=0.002&neo=1`

3\. Create offline web only version of signature.network where you can safely add your private key to sign transactions 

4\. Provide option for users to store their source file and signature in cloud.

5\. NeoAuth + NEO eSignature very close integration

6\. eSignature integration in wallets.

7\. Sign only option, that is not using NEO key/value storage for scalability

8\. API endpoint for machine to machine data signing (Identity is not only for humans :) )

9\. Go beyond single blockchain helping NeoX verify entities.



---

![](resources/DA874C351E0EAE1745A2F7A52E09DC12.jpg)

By ANDIT Developer Team

