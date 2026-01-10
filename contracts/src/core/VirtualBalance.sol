// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VirtualBalance
 * @notice Library for virtual balance operations in the Aqua protocol
 * @dev Virtual balances are spending allowances, not custody. They enforce:
 *      virtualBalance ≤ actualWalletBalance
 *      This inequality is enforced at execution time via transferFrom.
 */
library VirtualBalance {
    /// @notice Represents a virtual balance with amount and token count
    struct Balance {
        uint248 amount;
        uint8 tokensCount;
    }

    /// @notice Special value indicating strategy is docked (inactive)
    uint8 internal constant DOCKED = 255;

    /// @notice Error thrown when balance is insufficient for operation
    error InsufficientBalance(uint256 requested, uint256 available);

    /// @notice Error thrown when strategy is not active
    error StrategyNotActive();

    /// @notice Error thrown on overflow
    error BalanceOverflow();

    /**
     * @notice Check if a balance represents an active strategy
     * @param balance The balance to check
     * @return True if strategy is active (tokensCount != 0 && tokensCount != DOCKED)
     */
    function isActive(Balance memory balance) internal pure returns (bool) {
        return balance.tokensCount != 0 && balance.tokensCount != DOCKED;
    }

    /**
     * @notice Decrease balance by specified amount
     * @dev Reverts if insufficient balance or strategy inactive
     * @param balance The balance to decrease (storage pointer)
     * @param amount The amount to decrease by
     */
    function decrease(Balance storage balance, uint256 amount) internal {
        if (!isActive(balance)) revert StrategyNotActive();
        if (balance.amount < amount) {
            revert InsufficientBalance(amount, balance.amount);
        }
        unchecked {
            balance.amount -= uint248(amount);
        }
    }

    /**
     * @notice Increase balance by specified amount
     * @dev Reverts on overflow
     * @param balance The balance to increase (storage pointer)  
     * @param amount The amount to increase by
     */
    function increase(Balance storage balance, uint256 amount) internal {
        uint256 newAmount = uint256(balance.amount) + amount;
        if (newAmount > type(uint248).max) revert BalanceOverflow();
        balance.amount = uint248(newAmount);
    }

    /**
     * @notice Initialize a new balance
     * @param balance The balance to initialize (storage pointer)
     * @param amount The initial amount
     * @param tokenCount The number of tokens in the strategy
     */
    function initialize(Balance storage balance, uint256 amount, uint8 tokenCount) internal {
        if (amount > type(uint248).max) revert BalanceOverflow();
        balance.amount = uint248(amount);
        balance.tokensCount = tokenCount;
    }

    /**
     * @notice Dock a strategy (make it inactive)
     * @param balance The balance to dock
     */
    function dock(Balance storage balance) internal {
        balance.tokensCount = DOCKED;
    }

    /**
     * @notice Get the current amount from a balance
     * @param balance The balance to read
     * @return The current amount
     */
    function getAmount(Balance memory balance) internal pure returns (uint256) {
        return uint256(balance.amount);
    }
}
