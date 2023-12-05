// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import '../base/ImmutableState.sol';

contract ImmutableStateTest is ImmutableState {
    constructor(address _legacyFactory, address _positionManager) ImmutableState(_legacyFactory, _positionManager) {}
}
