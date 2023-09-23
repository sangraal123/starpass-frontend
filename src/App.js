import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
/* ABIファイルを含むWavePortal.jsonファイルをインポートする*/
import abi from "./SocialNetwork.json";

const App = () => {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義 */
  const [currentAccount, setCurrentAccount] = useState("");

  /* デプロイされたコントラクトのアドレスを保持する変数を作成 */
  const contractAddress = "0x3e0EFf5dc0EcCf4160d31f8A7F5fbcf88EF42b3c";
  /* コントラクトからすべてのwavesを取得するメソッドを作成 */
  /* ABIの内容を参照する変数を作成 */
  const contractABI = abi.abi;  

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
         <h1 className="title">Decentralized BBS</h1>
         <h2 className="subtitle">匿名掲示板</h2>
       </div>
       <div className="container is-half">
       {!currentAccount && (
        <button className="button is-primary is-pulled-right" onClick={connectWallet} >
            Connect Wallet
        </button>
       )}
       {currentAccount && (
        <button className="button is-primary is-pulled-right">Wallet Connected</button>
       )}
       </div>
     </div>
   </div>
   <div className="section">
     <div className="container">
       <h3 className="title is-3">投稿フォーム</h3>
       <div className="columns">
         <form className="column box" action="javascript:void(0)" /* onSubmit={this.onSubmit} */>
           <div className="field">
             <label className="label">タイトル</label>
             <div className="control">
               <input className="input" type="text" /* value={this.state.title} onChange={this.onChange} */ />
             </div>
           </div>
           <div className="field">
             <label className="label">本文</label>
             <div className="control">
               <textarea className="textarea" /* onChange={this.onTextAreaChange} value={this.state.content} */></textarea>
             </div>
           </div>
           <input className="button is-primary" type="submit" value="投稿する" />
         </form>
       </div>
     </div>
   </div>
   <div className="section">
     <div className="container">
     {/*  <List posts={this.state.posts} /> */}
    </div>
  </div>
 </div>
  );
}

export default App;
