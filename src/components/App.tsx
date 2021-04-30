import React, {Fragment, useState, useEffect} from 'react';
import './App.css';
import Web3 from 'web3';
// @ts-ignore
import Jdenticon from 'react-jdenticon';
import Decentragram from '../abis/Decentragram.json';

const IPFS = require('ipfs-core')

const App = () => {

    const [account, setAccount] = useState('');
    const [decentragram, setDecentragram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagesCount, setImagesCount] = useState()
    const [buffer, setBuffer] = useState<any>();
    const [description, setDescription] = useState<any>();
    const [images, setImages] = useState([]);
    const loadWeb3 = async () => {
        // @ts-ignore
        if(window.ethereum) {
            // @ts-ignore
            window.web3 = new Web3(window.ethereum);
            // @ts-ignore
            await window.ethereum.enable()
        }// @ts-ignore
        else if (window.web3) {
            // @ts-ignore
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('Non-Ethereum detected. You should consider trying MetaMask!')
        }
    }

    // @ts-ignore
    const loadBlockChainData = async () => {
        // @ts-ignore
        const web3 = window.web3;

        const accounts = await web3.eth.getAccounts()
        setAccount(accounts[0])

        const networkId = await web3.eth.net.getId()
        // @ts-ignore
        const networkData = Decentragram.networks[networkId]
        if (networkData) {
            const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
            setDecentragram(decentragram)
            const imagesCount = await decentragram.methods.imageCount().call();
            setImagesCount(imagesCount)
            setLoading(false);

            let resultImages: any = []
            for (let i = 1; i <= imagesCount; i++) {
                const image = await decentragram.methods.images(i).call()
                // @ts-ignore
                resultImages.push(image)
            }
            setImages(resultImages)

        } else {
            alert("Decentragram contract has not been deployed to the Ethereum network")
        }
    }

    useEffect(() => {
        loadWeb3().then(() => loadBlockChainData());
    }, [])

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log("Here")
        uploadImage()
    }

    const handleImageUpload = (e: any) => {
        e.preventDefault()
        const file = e.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);

        reader.onloadend = () => {
            // @ts-ignore
            const img = new Buffer(reader.result)
            setBuffer(img)
        }
    }

    const uploadImage = async () => {
        const ipfs = await IPFS.create()
        console.log("Submitting file to ipfs...");
        const { cid } = await ipfs.add(buffer)
        setLoading(true)
        if (cid.string) {
            // @ts-ignore
            decentragram.methods.uploadImage(cid.string, description).send({
                from: account
            }).on('transactionHash', () => {
                setLoading(false)
            })
        }
    }

    useEffect(() => {
        if(buffer) {
            console.log(buffer)
        }
    }, [buffer])

    console.log(images)

    return (
        <Fragment>
            <div>
                <Jdenticon size="48" value={account} />
                {account}
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="file"
                        accept=".jpg, .jpeg, .png, .bmp, .gif"
                        onChange={handleImageUpload}
                    />
                    <input onChange={(e) => setDescription(e.target.value)} type="text"/>
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div>
                {images.map((img, idx) =>
                    <div key={idx}>
                        <p>{img["author"]}</p>
                        <p>{img["description"]}</p>
                        <img width={400} height={400} src={`https://ipfs.infura.io/ipfs/${img["hash"]}`} alt={img["hash"]}/>
                    </div>)}
            </div>
        </Fragment>
    );
}

export default App;
