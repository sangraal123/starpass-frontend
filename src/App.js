import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";


const App = () => {

  


  return (
    <div>
    <div className="hero is-info is-bold">
      <div className="hero-body is-flex">
        <div className="container is-half">
         <h1 className="title">Decentralized BBS</h1>
         <h2 className="subtitle">匿名掲示板</h2>
       </div>
       <div className="container is-half">
        <button className="button is-primary is-pulled-right" /* onClick={connectWallet} */>
            Connect Wallet
        </button>
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
