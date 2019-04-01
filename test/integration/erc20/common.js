/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
// import chaiAsPromised from 'chai-as-promised'
// import _ from 'lodash'
import { expect } from 'chai'
import { Client, providers, crypto } from '../../../src'
import config from './config'
import MetaMaskConnector from 'node-metamask'

const metaMaskConnector = new MetaMaskConnector({ port: config.metaMaskConnector.port })

function connectMetaMask () {
  before(async () => {
    console.log('\x1b[36m', 'Starting MetaMask connector on http://localhost:3333 - Open in browser to continue', '\x1b[0m')
    await metaMaskConnector.start()
  })
  after(async () => metaMaskConnector.stop())
}
/*
function deployERC20Contract (client) {
  return client.getMethod('sendTransaction')(null, 0, '608060405234801561001057600080fd5b506103e86000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610893806100656000396000f3fe608060405260043610610067576000357c010000000000000000000000000000000000000000000000000000000090048063095ea7b31461006c57806323b872dd146100df57806370a0823114610172578063a9059cbb146101d7578063dd62ed3e1461024a575b600080fd5b34801561007857600080fd5b506100c56004803603604081101561008f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506102cf565b604051808215151515815260200191505060405180910390f35b3480156100eb57600080fd5b506101586004803603606081101561010257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506103c1565b604051808215151515815260200191505060405180910390f35b34801561017e57600080fd5b506101c16004803603602081101561019557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506104ee565b6040518082815260200191505060405180910390f35b3480156101e357600080fd5b50610230600480360360408110156101fa57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610506565b604051808215151515815260200191505060405180910390f35b34801561025657600080fd5b506102b96004803603604081101561026d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061051d565b6040518082815260200191505060405180910390f35b600081600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36001905092915050565b6000600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054821115151561044e57600080fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825403925050819055506104e3848484610542565b600190509392505050565b60006020528060005260406000206000915090505481565b6000610513338484610542565b6001905092915050565b6001602052816000526040600020602052806000526040600020600091509150505481565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415151561057e57600080fd5b806000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101515156105cb57600080fd5b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054011015151561065857600080fd5b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054019050816000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540392505081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a3806000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020540114151561086157fe5b5050505056fea165627a7a723058201475da2a4bd9eb1f8136dc15a472b2de81eda156be3f4f13639c50d8ac89c9d00029')
}
*/

const ethereumNetworks = providers.ethereum.networks
const ethereumWithMetaMask = new Client()
ethereumWithMetaMask.addProvider(new providers.ethereum.EthereumRPCProvider(config.ethereum.rpc.host))
ethereumWithMetaMask.addProvider(new providers.ethereum.EthereumMetaMaskProvider(metaMaskConnector.getProvider(), ethereumNetworks[null]))
ethereumWithMetaMask.addProvider(new providers.ethereum.EthereumERC20Provider(config.token.address))
ethereumWithMetaMask.addProvider(new providers.ethereum.EthereumERC20SwapProvider())

const ethereumWithNode = new Client()
ethereumWithNode.addProvider(new providers.ethereum.EthereumRPCProvider(config.ethereum.rpc.host))
ethereumWithNode.addProvider(new providers.ethereum.EthereumERC20Provider(config.token.address))
ethereumWithNode.addProvider(new providers.ethereum.EthereumERC20SwapProvider())

const testClient = ethereumWithMetaMask
connectMetaMask()

const chain = {
  client: testClient
}

async function initiateAndVerify (chain, secretHash, swapParams) {
  console.log('\x1b[33m', `Initiating ${chain.id}: Watch prompt on wallet`, '\x1b[0m')
  const initiationParams = [swapParams.value, swapParams.recipientAddress, swapParams.refundAddress, secretHash, swapParams.expiration]
  const [ initiationTx, initiationTxId ] = await Promise.all([
    chain.client.findInitiateSwapTransaction(...initiationParams),
    chain.client.initiateSwap(...initiationParams)
  ])
  expect(initiationTx.hash).to.equal(initiationTxId)
  const isVerified = await chain.client.verifyInitiateSwapTransaction(initiationTxId, ...initiationParams)
  expect(isVerified).to.equal(true)
  console.log(`${chain.id} Initiated ${initiationTxId}`)
  return initiationTxId
}

describe('ERC20 Basic functionality', function () {
  this.timeout(300000000)

  describe.only('Basic ERC20 transfer', function () {
    it('Transfer', async () => {
      const swapParams = {
        value: 42,
        recipientAddress: '0xc633C8d9e80a5E10bB939812b548b821554c49A6',
        refundAddress: '0xc633C8d9e80a5E10bB939812b548b821554c49A6',
        secretHash: crypto.sha256('1e8604b5c657db8456b5a235c26b93b905e0c3f4e1f45100f672d15f92bac38a'),
        expiration: 1000
      }
      await initiateAndVerify(chain, swapParams.secretHash, swapParams)
    })
  })
  describe('Basic ERC20 transfer', function () {
    it('Transfer', async () => {
      var secretHash = crypto.sha256('1e8604b5c657db8456b5a235c26b93b905e0c3f4e1f45100f672d15f92bac38a')
      var recipientAddress = '0xc633C8d9e80a5E10bB939812b548b821554c49A6'
      var refundAddress = '0xc633C8d9e80a5E10bB939812b548b821554c49A6'
      var expiration = 1568194353
      await testClient.initiateSwap(1, recipientAddress, refundAddress, secretHash, expiration)
    })
  })

  describe('Basic ERC20 transfer', function () {
    it('Transfer', async () => {
      // deployERC20Contract(testClient)
      const senderAddress = (await testClient.getUnusedAddress()).address
      const receiverAddress = '0000000000000000000000000000000000000001'
      const amount = 1
      const senderBalanceBefore = await testClient.getMethod('erc20Balance')([senderAddress])
      const receiverBalanceBefore = await testClient.getMethod('erc20Balance')([receiverAddress])
      await testClient.getMethod('erc20Transfer')(receiverAddress, amount)
      await testClient.getMethod('findErc20Transfer')(senderAddress, receiverAddress, amount)
      const senderBalanceAfter = await testClient.getMethod('erc20Balance')([senderAddress])
      const receiverBalanceAfter = await testClient.getMethod('erc20Balance')([receiverAddress])
      expect(senderBalanceAfter).to.equal(senderBalanceBefore - amount)
      expect(receiverBalanceAfter).to.equal(receiverBalanceBefore + amount)
    })
  })
})
