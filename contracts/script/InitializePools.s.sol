// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ConcentratedLiquiditySwap} from "../src/amm/ConcentratedLiquiditySwap.sol";
import {StableswapAMM} from "../src/amm/StableswapAMM.sol";

/**
 * @title InitializePools
 * @notice Initializes pools on the deployed AMM contracts
 * @dev Run with: forge script script/InitializePools.s.sol:InitializePools --rpc-url https://rpc-amoy.polygon.technology --broadcast -vvv
 */
contract InitializePools is Script {
    // Polygon Amoy deployed addresses (checksummed)
    address constant CONCENTRATED_LIQUIDITY = 0xF49b2D826ef41caEe234e337f3ED6b05ffB34a34;
    address constant STABLESWAP_AMM = 0xE07801006EeBa6aAc227AB8134bA957c57456872;
    address constant AQUA = 0x61559c0a117fa3a0D5C09753CaEf9B60C46DBe03;
    
    // Polygon Amoy test tokens
    address constant USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant USDT = 0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("==============================================");
        console.log("Initializing Pools on Polygon Amoy");
        console.log("==============================================");

        vm.startBroadcast(deployerPrivateKey);

        // Initialize ConcentratedLiquidity pool for USDC/USDT
        console.log("\n[1/2] Initializing ConcentratedLiquidity USDC/USDT pool...");
        ConcentratedLiquiditySwap concentrated = ConcentratedLiquiditySwap(CONCENTRATED_LIQUIDITY);
        
        // sqrtPriceX96 for 1:1 price = sqrt(1) * 2^96 = 79228162514264337593543950336
        uint160 sqrtPriceX96 = 79228162514264337593543950336;
        
        concentrated.initializePool(
            USDC,
            USDT,
            3000,  // 0.3% fee
            sqrtPriceX96
        );
        console.log("ConcentratedLiquidity pool initialized!");

        // Create StableswapAMM pool for USDC/USDT
        console.log("\n[2/2] Creating StableswapAMM USDC/USDT pool...");
        StableswapAMM stableswap = StableswapAMM(STABLESWAP_AMM);
        
        uint256 poolId = stableswap.createPool(
            USDC,
            USDT,
            100,  // amplification factor (high = more stable)
            30    // 0.3% fee in bps
        );
        console.log("StableswapAMM pool created! Pool ID:", poolId);

        vm.stopBroadcast();

        console.log("\n==============================================");
        console.log("POOLS INITIALIZED!");
        console.log("==============================================");
    }
}
