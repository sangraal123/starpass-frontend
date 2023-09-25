import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./SocialNetwork.json";

const App = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義 */
  const [currentAccount, setCurrentAccount] = useState("");
  /* ユーザーのメッセージを保存するために使用する状態変数を定義 */
  const [messageValue, setMessageValue] = useState("");
  /* すべてのpostsを保存する状態変数を定義 */
  const [allPosts, setAllPosts] = useState([]);

  /* デプロイされたコントラクトのアドレスを保持する変数を作成 */
  const contractAddress = "0x1bd2863C4dE9bF9359f744fa6553C3cCC044Be4d";
  /* コントラクトからすべてのwavesを取得するメソッドを作成 */
  /* ABIの内容を参照する変数を作成 */
  const contractABI = abi.abi;
  
  const getAllPosts = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const SocialNetworkContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const posts = [];
        /* コントラクトからgetPostメソッドを再帰的に呼び出す */
        const lastId = await SocialNetworkContract.getLastPostId();
        for (let i = 1; i <= lastId; i++) {
          let post = await SocialNetworkContract.getPost(i);
          let postObject = {
            poster: post.poster, 
            message: post.message,
            time: new Date(post.time * 1000),
            totalLikes: post.totalLikes,
            id: i
          };
          posts["id"] = i;
          posts.push(postObject);
          console.log(postObject.poster, postObject.message, postObject.time, postObject.totalLikes, postObject.id);
        }

        /* React Stateにデータを格納する */
        setAllPosts(posts);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const post = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        /* ABIを参照 */
        const SocialNetworkContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const postTxn = await SocialNetworkContract.post(messageValue, {
          gasLimit: 300000,
        });
        console.log("Mining...", postTxn.hash);
        await postTxn.wait();
        console.log("Mined -- ", postTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   `emit`されたイベントをフロントエンドに反映させる
   */
  useEffect(() => {
    let SocialNetworkContract;

    const onNewPost = (poster, message, timestamp, likes, id) => {
      console.log("NewPost", poster, message, timestamp, likes, id);
      setAllPosts((prevState) => [
        ...prevState,
        {
          poster: poster,
          message: message,
          time: new Date(timestamp * 1000),
          totalLikes: likes,
          id: id,
        },
      ]);
    };

    /* NewPostイベントがコントラクトから発信されたときに、情報をを受け取ります */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      SocialNetworkContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      SocialNetworkContract.on("NewPost", onNewPost);
    }
    /*メモリリークを防ぐために、NewPostのイベントを解除します*/
    return () => {
      if (SocialNetworkContract) {
        SocialNetworkContract.off("NewPost", onNewPost);
      }
    };
  }, []);

  /* window.ethereumにアクセスできることを確認する関数を実装 */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認 */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllPosts();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* connectWalletメソッドを実装 */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div>
    <div className="hero is-info is-bold">
      <div className="hero-body is-flex">
        <div className="container is-half">
         <h1 className="title">分散型掲示板</h1>
         <h2 className="subtitle">オンチェーン保存(Sepolia Testnet)</h2>
       </div>
       <div className="container is-half">
       {!currentAccount && (
        <button className="button is-primary is-pulled-right" onClick={connectWallet} >
            ウォレットを接続してください
        </button>
       )}
       {currentAccount && (
        <button className="button is-primary is-pulled-right">ウォレット接続済み</button>
       )}
       </div>
     </div>
   </div>
   <div className="section">
     <div className="container">
       <h3 className="title is-3">投稿フォーム</h3>
       <div className="column">
        <div className="field">
             <label className="label">メッセージ</label>
             <div className="control">
               <textarea className="textarea" placeholder="メッセージを入力してください" onChange={(e) => setMessageValue(e.target.value)} value={messageValue} ></textarea>
             </div>
        </div>   
        <button className="button is-primary" onClick={post}  >
            投稿する
        </button>
       </div>
     </div>
   </div>
   <div className="section">
     <div className="container">
     {  allPosts
            .slice(0)
            .reverse()
            .map((post, index) => {
              return (
                <div key={index} className="box">
                  <div>ID: {post.id.toString()}</div>
                  <div>Address: {post.poster}</div>
                  <div>Message: {post.message}</div>
                  <div>Time: {post.time.toUTCString()}</div>
                  <div>Likes: {post.totalLikes.toString()}</div>
                </div>
              );
            })}
    </div>
  </div>
 </div>
  );
}

export default App;
