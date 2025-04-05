# BlockShare Chatbot Documentation
### Q: Hello chatbot 
A: Welcome to BlockShare Chatbot! I'm here to help you with any questions or concerns you may have about BlockShare. How can I assist you today?

## Introduction
BlockShare is a decentralized data-sharing platform using libP2P and IPFS for storage.

## Features
- **Decentralized Storage**: Files are stored and shared via IPFS.
- **Permission Management**: Users control access without smart contracts.

## How It Works
- If both users are online, the file is directly shared through the P2P connection without storing it in IPFS.
- If the receiver is offline, the file is stored in IPFS, and the hash of the file is sent to the receiver. The hash is stored in a message queue.
- When the receiver comes online, they will see the file receiving request and use the hash to download the file.
- Metadata and access permissions are managed within the system.
- The chatbot can retrieve FAQs, technical details, and troubleshooting steps.

---

### Q: How do I share a file with someone?
A: To share a file with someone, you'll need to follow these steps:
1. Ensure you have the file you want to share saved on your device.
2. Open the BlockShare app and navigate to the share data button.
3. Enter the recipient's public key.
4. Select the file you want to share.
5. Click on send button.
The file will be shared directly through the P2P connection if the recipient is online. If they're offline, the file will be stored in IPFS and the hash will be sent to the recipient


### Q : How do I access a shared file?
A: To access a shared file, you'll need to follow these steps:
1. Open the messege queue .
2. Find the file receiving request.
3. Use the hash to download the file from IPFS.
4. The file will be downloaded to your device.



## FAQs

### Uploading & Downloading Files

#### Q: How do I upload a file?  
A: Use the BlockShare interface to select and upload a file.

#### Q: How do I retrieve a file?  
A: Search using the file hash in the retrieval section.

---

## General Questions

#### Q: What is BlockShare?  
A: BlockShare is a decentralized data-sharing platform that uses libP2P for peer-to-peer networking and IPFS for file storage and retrieval.

#### Q: How does BlockShare work?  
A: Users can upload files to IPFS, where they are stored as unique content-addressable hashes. The platform manages metadata and permissions, allowing users to share files securely without relying on blockchain or smart contracts.

#### Q: Is BlockShare free to use?  
A: Yes BlockShare is totally free of cost.

#### Q: What types of files can I upload?  
A: You can upload any type of file, including documents, images, videos, and more. However, large files may require additional storage configurations.

#### Q: how to login to blockshare?  
A: For log in blokshare you need to regestered first , if you alredy register then try to login with your registered email and password.

#### Q: how to register to blockshare?  
A: for registration firstly enter the username and email with you want to register with then otp will share on that email for authentication, after successfull authentication enter valid and strong password for your blockshare profile and you are all set to share data through blockshare.

#### Q: how to contact to the Blockshare team?  
A: you can contact to the blockshare team with thier email cloudabhi123@gmail.com , rohitshinde0343@gmail.com.
---

## Uploading & Downloading Files

#### Q: How do I upload a file?  
A: To upload a file, go to the BlockShare interface, select your file, and click the upload button. The system will generate an IPFS hash for retrieval.

#### Q: How do I download a file?  
A: You can retrieve a file by entering its unique IPFS hash into the search bar. If the file is available on the network, it will be downloaded.

#### Q: Can I delete an uploaded file?  
A: Since IPFS is a distributed system, files remain accessible as long as at least one node is storing them. You can unpin a file from your node, but others may still have copies.

---

## Security & Privacy

#### Q: How secure is my data on BlockShare?  
A: BlockShare does not store your data on a central server. Instead, files are stored in a decentralized manner using IPFS, ensuring security through cryptographic hashing.

#### Q: Can unauthorized users access my files?  
A: No, BlockShare includes access control mechanisms that allow only authorized users to retrieve shared files.

#### Q: What happens if I lose my file hash?  
A: BlockShare will helps you to maintain your hesh in the messege queue, if the file is important then try to store it in your local storage.

---

## Technical & Performance Questions

#### Q: How fast is file retrieval on BlockShare?  
A: The speed of file retrieval depends on network availability and the number of nodes storing the file. Popular files with multiple sources load faster.

#### Q: Can I use BlockShare without an internet connection?  
A: No, an internet connection is required to access IPFS and retrieve files from the network.

#### Q: What technology stack does BlockShare use?  
A: BlockShare is built using libP2P for networking, IPFS for storage, and a RAG-based chatbot for knowledge retrieval.

---

## Troubleshooting

#### Q: Why is my file not uploading?  
A: Ensure that your internet connection is stable and that the file size is within the allowed limit. If the issue persists, check the error logs.

#### Q: Why can’t I retrieve my file?  
A: Your file may not be pinned on any active node. Try re-uploading or requesting another user to pin it.

#### Q: My chatbot isn’t responding. What should I do?  
A: Restart the chatbot service and ensure the RAG model is correctly loaded with the knowledge base.
