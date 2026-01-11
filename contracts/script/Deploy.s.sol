// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AquaLiquidityAccounting} from "../src/core/AquaLiquidityAccounting.sol";
import {StableswapAMM} from "../src/amm/StableswapAMM.sol";
import {ConcentratedLiquiditySwap} from "../src/amm/ConcentratedLiquiditySwap.sol";

/**
 * @title DeployAquaman
 * @notice Deploys Aquaman protocol contracts (simplified architecture)
 * @dev Run with: forge script script/Deploy.s.sol:DeployAquaman --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY -vvvv
 */
contract DeployAquaman is Script {
    // Deployed contract addresses
    AquaLiquidityAccounting public aqua;
    StableswapAMM public stableswapAMM;
    ConcentratedLiquiditySwap public concentratedLiquidity;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("==============================================");
        console.log("Aquaman Protocol Deployment (Simplified)");
        console.log("==============================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("==============================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Core Accounting Layer
        console.log("\n[1/3] Deploying AquaLiquidityAccounting...");
        aqua = new AquaLiquidityAccounting();
        console.log("AquaLiquidityAccounting deployed at:", address(aqua));

        // 2. Deploy StableswapAMM (requires Aqua)
        console.log("\n[2/3] Deploying StableswapAMM...");
        stableswapAMM = new StableswapAMM(address(aqua));
        console.log("StableswapAMM deployed at:", address(stableswapAMM));

        // 3. Deploy ConcentratedLiquiditySwap (requires Aqua)
        console.log("\n[3/3] Deploying ConcentratedLiquiditySwap...");
        concentratedLiquidity = new ConcentratedLiquiditySwap(address(aqua));
        console.log("ConcentratedLiquiditySwap deployed at:", address(concentratedLiquidity));

        // Post-deployment configuration
        console.log("\n==============================================");
        console.log("Post-Deployment Configuration");
        console.log("==============================================");

        // Register AMM contracts with Aqua
        console.log("Registering StableswapAMM as app...");
        aqua.setAppRegistration(address(stableswapAMM), true);

        console.log("Registering ConcentratedLiquidity as app...");
        aqua.setAppRegistration(address(concentratedLiquidity), true);

        vm.stopBroadcast();

        // Summary
        console.log("\n==============================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("==============================================");
        console.log("Chain ID:", block.chainid);
        console.log("----------------------------------------------");
        console.log("AquaLiquidityAccounting:", address(aqua));
        console.log("StableswapAMM:          ", address(stableswapAMM));
        console.log("ConcentratedLiquidity:  ", address(concentratedLiquidity));
        console.log("==============================================");
    }
}
