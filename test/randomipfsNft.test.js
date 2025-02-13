// fulfill random words.

const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs NFT unit tests", function () {
          let randomIpfsNft, deployer, accounts, vrfCoordinatorV2Mock
          chainId = network.config.chainId

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "randomipfs"])
              randomIpfsNft = await ethers.getContract("RandomipfsNft")
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })

          describe("constructor", function () {
              it("initialises NFT correctly", async function () {
                  const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0)
                  const initialized = await randomIpfsNft.getInitialized()
                  const name = await randomIpfsNft.name()
                  const symbol = await randomIpfsNft.symbol()
                  assert(dogTokenUriZero.includes("ipfs://"))
                  assert.equal(initialized, true)
                  assert.equal(name, "Random IPFS NFT")
                  assert.equal(symbol, "RAN")
              })
          })

          describe("request nft", function () {
              it("reverts when payment not sent", async function () {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomipfsNft__NeedMoreETHSent"
                  )
              })

              it("reverts if payment amount is less than the mint fee", async function () {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({
                          value: mintFee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWith("RandomipfsNft__NeedMoreETHSent")
              })

              it("emits an event and starts a random words request", async function () {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({
                          value: mintFee.toString()
                      })
                  ).to.emit(randomIpfsNft, "NftRequested")
              })
          })
      })
