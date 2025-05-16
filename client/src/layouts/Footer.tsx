const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4">Luxury Shop</h3>
            <p className="text-gray-300">
              Premium products for discerning customers.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <h4 className="text-sm font-semibold mb-3">
              © {new Date().getFullYear()} Luxury Shop. All rights reserved.
            </h4>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
