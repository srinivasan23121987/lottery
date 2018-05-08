const assert=require('assert');
const ganache=require('ganache-cli');
const Web3=require('web3');
const web3=new Web3(ganache.provider());
var events = require('events');
const emitter = new events.EventEmitter();
process.setMaxListeners(Infinity);
emitter.setMaxListeners(Infinity);
const {bytecode,interface}=require('../compile');

let lottery;
let accounts;

beforeEach("LotteryContractGetAccounts",async ()=>{
    accounts=await web3.eth.getAccounts()
    lottery=await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode}).send({from:accounts[0],gas:'1000000'})
})

describe('Lottery Contract',()=>{
    it('Lottery Deploy Contract',()=>{
        assert.ok(lottery.options.address)
    })
    it('Sending ether',async ()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value:web3.utils.toWei('0.02','ether')
        })
              await lottery.methods.enter().send({
            from:accounts[1],
            value:web3.utils.toWei('0.02','ether')
        })
              await lottery.methods.enter().send({
            from:accounts[2],
            value:web3.utils.toWei('0.02','ether')
        })
        const players=await lottery.methods.getPlayers().call({
            from:accounts[0]
        });

        assert.equal(accounts[0],players[0])
        assert.equal(accounts[1],players[1])
        assert.equal(accounts[2],players[2]) 
        assert.equal(players.length,3)
    })
    it('checking for min amount of ether',async ()=>{
        try{
    await lottery.methods.enter().send({
        from:accounts[0],
        value:0
    })
    assert.ok(false)
}
catch(err){
    assert.ok(err)
}
    })
    it('pick a winner',async ()=>{
        try{
        await lottery.methods.pickWinner().send({
            from:accounts[1]
        })
        assert.ok(false)
        }catch(err){
        assert.ok(err)
        }
    })
    it('Randomly pick a winner',async ()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value:web3.utils.toWei('2','ether')
        })
        const initialBalance=await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from:accounts[0]
        })
        console.log(initialBalance);
        const finalBalance=await web3.eth.getBalance(accounts[0]);
        console.log(finalBalance);
        const diffBalance=finalBalance-initialBalance;
        assert.ok(diffBalance > web3.utils.toWei('1.8','ether'));
    })
})
