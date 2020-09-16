import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import "./Home.css"
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import web3 from '../web3';
import ipfs from '../ipfs';
import cryptoid from "../crpytoid";
import Web3 from "web3"

function Home(props) {
    
        useEffect(async()=>{
            // ethEnabled()
            setValues()
        },[]);

        // const ethEnabled = () => {
        //     if (window.web3) {
        //       window.web3 = new Web3(window.web3.currentProvider);
        //       window.ethereum.enable();
        //       return true;
        //     }
        //     return false;
        //   }

    const history = useHistory();
    const [instituteName,setInstituteName] = useState("")
    const [instituteAddress,setInstituteAddress]= useState("")
    const [studentEnroll, setStudentEnroll]= useState("")
    const [openDialog,setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] =useState(false);
    const [buffer,setBuffer]= useState("")
    const [IPFSHash,setIpfsHash] = useState(null)
    const [ethAddress,setEthAddress] =useState("")
    const [transactionHash,setTransactionHash] = useState()



    const handleSnackbarClose=(event,reason)=>{
          setOpenSnackbar(false);
    }
    const handleAddDialog=()=>{
        setOpenDialog(false);
        setOpenSnackbar(true)
    }
    
    const setValues = ()=>{
        if (props.location.instituteName) {
            setInstituteName(props.location.instituteName.instituteName)
            setInstituteAddress(props.location.instituteAddress.instituteAddress)
            
        } else {
            history.push('/login')
        }
    }
    const convertToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        setBuffer(buffer);
    };
    const captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => convertToBuffer(reader)    
      };


    const onSubmit = async (event) => {
        event.preventDefault();

        //bring in user's metamask account address
        
        const accounts = await web3.eth.getAccounts();
        console.log('Sending from Metamask account: ' + accounts);
        //obtain contract address from storehash.js
        
        const ethAddress= cryptoid.options.address;
        setEthAddress({ethAddress});
        console.log(ethAddress);

        //hash: "Qmb4kWJKrTuJBZozrvfdT8Jm2H7cWGXTqvShmBufsf76v4"
        // path: "Qmb4kWJKrTuJBZozrvfdT8Jm2H7cWGXTqvShmBufsf76v4"
        // size: 1780339
        // 0x7FDD9C6207a1723Eb167596568cd80E74c15664E

        //save document to IPFS,return its hash#, and set hash# to state
        //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
        await ipfs.add(buffer, (err, ipfsHash) => {
          console.log(`Error: ${err}, ipfsHash: ${ipfsHash}`);
        
          //setState by setting ipfsHash to ipfsHash[0].hash 
        //cryptoid.methods.newIdentityCard({enrollmentNumber:studentEnroll,ipfsHash:ipfsHash[0].hash,_instituteName:instituteName});
         console.log(ipfsHash)
        
        setIpfsHash(ipfsHash[0].hash);
        const ipHash = ipfsHash[0].hash;
        // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
        //return the transaction hash from the ethereum contract
        //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
        
        console.log("Institute Name"+instituteName);

        cryptoid.methods.newIdentityCard(studentEnroll,ipHash,instituteName).send({
            from: accounts[0] 
        }, (error, transactionHash) => {
            console.log(`Transaction Hash : ${transactionHash}`);
            setTransactionHash({transactionHash});
        });

        //   storehash.methods.sendHash(this.state.ipfsHash).send({
        //     from: accounts[0] 
        //   }, (error, transactionHash) => {
        //     console.log(transactionHash);
        //     this.setState({transactionHash});
        //   }); //storehash 
        }) //await ipfs.add 
      }; //onSubmit

      const onStudentEnrollSubmit = (e)=>{
          setStudentEnroll(e.target.value);
        //   console.log(studentEnroll)
      }
    

    return (
        <div className="home">
            <div className="home__header">
                <h1>CRYPTO ID</h1>
            </div>
            {
                !openDialog ? (
                    <form  className="home__body">
                        <div className="body__input">
                            <p>Institute Name</p>
                            <p>{instituteName ?? ""}</p>
                        </div>
                
                        <div className="body__input">
                            <p >Institute Address</p>
                            <p>{instituteAddress??""}</p>
                        </div>
                        <div className="body__input">
                            <p>Student Count</p>
                            <center><h3>10</h3></center>
                        </div>
                    </form>
                ):
                <Dialog open={openDialog} onClose={()=>setOpenDialog(false)}>
                    <DialogTitle>Student Details</DialogTitle>
                    <DialogContent className="dialog__content">
                        <TextField
                            value={studentEnroll}
                            onChange={onStudentEnrollSubmit}
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Student Enrollment Number"
                            fullWidth

                        />
                        <h3> Choose file to send to IPFS </h3>
                        <form className="addStudentForm" onSubmit={onSubmit}>
                        <input 
                        type = "file"
                        onChange = {captureFile}
                        />
                        <button 
                        type="submit"> 
                        Add
                        </button>
                        </form>
                    </DialogContent>
                </Dialog>
            }
            <div className="home__button">
                <button onClick={()=>setOpenDialog(true)}>Add New Student ID</button>
                <button>Get Student ID</button>
            </div>
            {openSnackbar?(
                <Snackbar
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Student Added"
                action={
                <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                    <CloseIcon fontSize="small" />
                    </IconButton>
                </React.Fragment>
                }
            />
            ):<div/>}
            
        </div>
    )
}

export default Home
