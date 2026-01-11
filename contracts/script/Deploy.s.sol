// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AquaLiquidityAccounting} from "../src/core/AquaLiquidityAccounting.sol";
import {EscrowVault} from "../src/settlement/EscrowVault.sol";
import {CrossChainSettlement} from "../src/settlement/CrossChainSettlement.sol";
import {StableswapAMM} from "../src/amm/StableswapAMM.sol";
import {ConcentratedLiquiditySwap} from "../src/amm/ConcentratedLiquiditySwap.sol";
import {IntentManager} from "../src/intent/IntentManager.sol";

/**
 * @title DeployAquaman
 * @notice Deploys all Aquaman protocol contracts
 * @dev Run with: forge script script/Deploy.s.sol:DeployAquaman --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY -vvvv
 */
contract DeployAquaman is Script {
    // Deployed contract addresses
    AquaLiquidityAccounting public aqua;
    EscrowVault public escrowVault;
    CrossChainSettlement public crossChainSettlement;
    StableswapAMM public stableswapAMM;
    ConcentratedLiquiditySwap public concentratedLiquidity;
    IntentManager public intentManager;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("==============================================");
        console.log("Aquaman Protocol Deployment");
        console.log("==============================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("==============================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Core Accounting Layer
        console.log("\n[1/6] Deploying AquaLiquidityAccounting...");
        aqua = new AquaLiquidityAccounting();
        console.log("AquaLiquidityAccounting deployed at:", address(aqua));

        // 2. Deploy EscrowVault
        console.log("\n[2/6] Deploying EscrowVault...");
        escrowVault = new EscrowVault();
        console.log("EscrowVault deployed at:", address(escrowVault));

        // 3. Deploy CrossChainSettlement (requires EscrowVault)
        console.log("\n[3/6] Deploying CrossChainSettlement...");
        crossChainSettlement = new CrossChainSettlement(address(escrowVault));
        console.log("CrossChainSettlement deployed at:", address(crossChainSettlement));

        // 4. Deploy StableswapAMM (requires Aqua)
        console.log("\n[4/6] Deploying StableswapAMM...");
        stableswapAMM = new StableswapAMM(address(aqua));
        console.log("StableswapAMM deployed at:", address(stableswapAMM));

        // 5. Deploy ConcentratedLiquiditySwap (requires Aqua)
        console.log("\n[5/6] Deploying ConcentratedLiquiditySwap...");
        concentratedLiquidity = new ConcentratedLiquiditySwap(address(aqua));
        console.log("ConcentratedLiquiditySwap deployed at:", address(concentratedLiquidity));

        // 6. Deploy IntentManager
        console.log("\n[6/6] Deploying IntentManager...");
        intentManager = new IntentManager();
        console.log("IntentManager deployed at:", address(intentManager));

        // Post-deployment configuration
        console.log("\n==============================================");
        console.log("Post-Deployment Configuration");
        console.log("==============================================");

        // Register AMM contracts with Aqua
        console.log("Registering StableswapAMM as app...");
        aqua.setAppRegistration(address(stableswapAMM), true);

        console.log("Registering ConcentratedLiquidity as app...");
        aqua.setAppRegistration(address(concentratedLiquidity), true);

        // Authorize CrossChainSettlement as relayer on EscrowVault
        console.log("Authorizing CrossChainSettlement as relayer...");
        escrowVault.setRelayer(address(crossChainSettlement), true);

        vm.stopBroadcast();

        // Summary
        console.log("\n==============================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("==============================================");
        console.log("Chain ID:", block.chainid);
        console.log("----------------------------------------------");
        console.log("AquaLiquidityAccounting:", address(aqua));
        console.log("EscrowVault:            ", address(escrowVault));
        console.log("CrossChainSettlement:   ", address(crossChainSettlement));
        console.log("StableswapAMM:          ", address(stableswapAMM));
        console.log("ConcentratedLiquidity:  ", address(concentratedLiquidity));
        console.log("IntentManager:          ", address(intentManager));
        console.log("==============================================");
    }
}
