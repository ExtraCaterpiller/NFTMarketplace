import { ConnectButton } from "@web3uikit/web3"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">NFT Marketplace</h1>
            <div className="flex flex-row items-center">
                <Link href="/">
                    <div className="mr-4 p-6">Home</div>
                </Link>
                <Link href="/sell-nft">
                    <div className="mr-4 p-6">Sell NFT</div>
                </Link>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}