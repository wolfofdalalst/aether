import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold">Aether</h1>
      <nav className="mt-2">
        <ul className="flex space-x-4">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;