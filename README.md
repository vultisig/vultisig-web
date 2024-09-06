# Vultisig Web App

This repository contains the frontend code for the Vultisig platform. The Vultisig Web App is built with React and allows users to interact seamlessly with the Vultisig Airdrop Registry backend. Users can manage their vaults, track balances, and participate in the $VULT airdrop through an intuitive web interface.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)

## Overview

The Vultisig Web App serves as the primary interface for interacting with the Vultisig Airdrop Registry. Users can upload their Vault QR code to load their vault, manage supported chains and tokens, and track their balances across multiple blockchains. Additionally, users can monitor their liquidity provider (LP) positions, Saver accounts, and Bond information on Thorchain and MayaChain.

## Features

- **Vault Management**: 
  - Upload a Vault QR code containing vault public data (ECDSA public key, EDdsa public key, UID, vault name, etc.) to load and manage your vault.
  - Add or remove supported chains and tokens to track balances effectively.
  
- **Airdrop Participation**: 
  - Join or exit the $VULT airdrop directly from the interface, interacting with the Vultisig Airdrop Registry API.
  
- **Balance Tracking**:
  - Automatically fetch and display the balance of your vault for each token using public RPC endpoints for various blockchains.
  - Track LP positions, Saver accounts, and Bond information on Thorchain and MayaChain.
  
- **Shareable Vault Information**:
  - Generate and share a link containing your vault's public information for various purposes such as proof of reserve.
  
## Usage

- **Upload Vault QR Code**: Upload your Vault QR code to load your vault's public data, including ECDSA and EDdsa public keys, UID, vault name, and more.
- **Manage Chains and Tokens**: Add or remove chains and tokens within your vault to keep track of your balances.
- **Track Balances and Positions**: Monitor your balances across different chains, as well as your LP, Saver, and Bond information on Thorchain and MayaChain.
- **Join or Exit Airdrop**: Use the interface to register your vault for the $VULT airdrop or to exit the airdrop as needed.
- **Share Vault Information**: Create a shareable link with your vault's public information to use for proof of reserve or other goals.

## License

This project is licensed under the STMF License (Set the Memes Free).

For full terms and conditions, please refer to the [Vultisig License Documentation](https://docs.vultisig.com/other/licence).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.
