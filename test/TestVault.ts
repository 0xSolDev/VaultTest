import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
describe("TestVault", function () {
  let contract, vtk: Contract;
  let owner: Signer;
  let user1, user2, user3, user4, user5, user6: Signer;

  let zero_addr = "0x0000000000000000000000000000000000000000";

  let INITIAL = 10000;

  beforeEach(async function () {
    [owner, user1, user2, user3, user4, user5, user6] =
      await ethers.getSigners();

    //Deploy VTK Token
    const FactoryVTK = await ethers.getContractFactory("VTK");
    vtk = await FactoryVTK.deploy();

    // Mint Tokens to users
    await vtk.mint(user1.getAddress(), INITIAL);
    await vtk.mint(user2.getAddress(), INITIAL);
    await vtk.mint(user3.getAddress(), INITIAL);
    await vtk.mint(user4.getAddress(), INITIAL);
    await vtk.mint(user5.getAddress(), INITIAL);
    await vtk.mint(user6.getAddress(), INITIAL);

    //Deploy Vault Token
    const VaultFactorty = await ethers.getContractFactory("TestVault");
    contract = await VaultFactorty.deploy(vtk.address);
  });

  describe("1. staking token", () => {
    it("should have correct balance", async () => {
      console.log("User1", await vtk.balanceOf(user1.getAddress()));
      console.log("User2", await vtk.balanceOf(user1.getAddress()));
    });
    it("should revert if the token address is zero", async () => {
      const VaultFactorty = await ethers.getContractFactory("TestVault");
      await expect(VaultFactorty.deploy(zero_addr)).to.revertedWith(
        "INVALID_TOKEN"
      );
    });
    it("staking token needs to be set if the constructor called", async () => {
      expect(vtk.address).to.equal(await contract.staking());
    });
  });

  describe("2. deposit function test", () => {
    it("tokens should transfer from users's wallet", async () => {
      await vtk.connect(user1).approve(contract.address, 1000);
      await contract.connect(user1).Deposit(1000);

      expect(await vtk.balanceOf(user1.getAddress())).to.equal(9000);
    });
    it("double deposit", async () => {
      await vtk.connect(user1).approve(contract.address, 3000);
      await contract.connect(user1).Deposit(1000);
      await contract.connect(user1).Deposit(2000);

      expect(await vtk.balanceOf(user1.getAddress())).to.equal(7000);
    });
    it("contract balance should be increased when deposits", async () => {
      await vtk.connect(user1).approve(contract.address, 1000);
      await contract.connect(user1).Deposit(1000);

      expect(await vtk.balanceOf(contract.address)).to.equal(1000);
    });
    it("Deposit EVENT should be occurred", async () => {
      await vtk.connect(user1).approve(contract.address, 1000);
      expect(await contract.connect(user1).Deposit(1000))
        .to.emit(contract, "Deposited")
        .withArgs(await user1.getAddress(), 1000);
    });
  });

  describe("3. withdraw function test", () => {
    it("tokens should transfer from contract", async () => {
      await vtk.connect(user1).approve(contract.address, 1000);
      await contract.connect(user1).Deposit(1000);

      await contract.connect(user1).Withdraw(500);

      expect(await vtk.balanceOf(contract.address)).to.equal(500);
    });

    it("should revert1", async () => {
      await vtk.connect(user1).approve(contract.address, 1000);
      await contract.connect(user1).Deposit(1000);

      await expect(contract.connect(user1).Withdraw(5000)).to.revertedWith(
        "NOT_ENOUGH_TOKENS_TO_WITHDRAW"
      );
    });
    it("should revert2", async () => {
      await expect(contract.connect(user1).Withdraw(5000)).to.revertedWith(
        "NO_TOKENS_TO_WITHDRAW"
      );
    });

    it("Withdrawn EVENT should be occurred", async () => {
      await vtk.connect(user1).approve(contract.address, 1000);
      await contract.connect(user1).Deposit(1000);

      expect(await contract.connect(user1).Withdraw(1000))
        .to.emit(contract, "Withdrawn")
        .withArgs(await user1.getAddress(), contract.address, 1000);
    });
  });

  describe("3. highestUsers test", () => {
    it("it should return highest 2 users", async () => {
      await vtk.connect(user1).approve(contract.address, 3000);
      await contract.connect(user1).Deposit(3000);

      await vtk.connect(user2).approve(contract.address, 2000);
      await contract.connect(user2).Deposit(2000);

      await vtk.connect(user3).approve(contract.address, 2000);
      await contract.connect(user3).Deposit(2000);

      await vtk.connect(user4).approve(contract.address, 4000);
      await contract.connect(user4).Deposit(4000);

      await vtk.connect(user5).approve(contract.address, 1000);
      await contract.connect(user5).Deposit(1000);

      let highest: string[] = [user4.address, user1.address];
      expect(await contract.highestUsers()).to.deep.equal(highest);
    });
  });
});
