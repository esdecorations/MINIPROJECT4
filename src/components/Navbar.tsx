import { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from '../images/logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogoClick = () => {
    if (isHomePage) {
      // If already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If on different page, navigate to home
      navigate('/');
    }
  };

  const navItems = [
    { name: 'About Us', type: 'scroll', to: 'about-us' },
    { name: 'Services', type: 'scroll', to: 'services' },
    { name: 'Our Team', type: 'scroll', to: 'our-team' },
    { name: 'Gallery', type: 'route', to: '/gallery' },
    { name: 'FAQ', type: 'route', to: '/faq' },
    { name: 'Careers', type: 'route', to: '/careers' }
  ];

  const renderNavItem = (item: typeof navItems[0]) => {
    if (!isHomePage && item.type === 'scroll') {
      return (
        <RouterLink
          key={item.name}
          to={`/#${item.to}`}
          className="text-white hover:text-gray-300"
        >
          <motion.span
            whileHover={{ y: -2 }}
            className="relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-white after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
          >
            {item.name}
          </motion.span>
        </RouterLink>
      );
    }

    if (item.type === 'scroll') {
      return (
        <ScrollLink
          key={item.name}
          to={item.to}
          smooth={true}
          duration={500}
          offset={-80} // Account for fixed navbar height
          className="text-white hover:text-gray-300 cursor-pointer"
        >
          <motion.span
            whileHover={{ y: -2 }}
            className="relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-white after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
          >
            {item.name}
          </motion.span>
        </ScrollLink>
      );
    }

    return (
      <RouterLink
        key={item.name}
        to={item.to}
        className="text-white hover:text-gray-300"
      >
        <motion.span
          whileHover={{ y: -2 }}
          className="relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-white after:left-0 after:-bottom-1 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
        >
          {item.name}
        </motion.span>
      </RouterLink>
    );
  };

  return (
    <div>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full bg-black/90 backdrop-blur-sm z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            className="text-white text-2xl font-bold flex items-center gap-2 cursor-pointer"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              whileHover={{
                rotate: 360,
                transition: { duration: 0.6 }
              }}
              className="relative"
            >
              <img src={logo} alt="E&S Logo" className="w-12 h-12 object-contain" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-r from-white via-blue-300 to-white bg-300% bg-clip-text text-transparent"
              style={{ backgroundSize: "300% 100%" }}
            >
              E&S
            </motion.span>
          </motion.div>

          <div className="hidden md:flex gap-8">
            {navItems.map(item => renderNavItem(item))}
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-white focus:outline-none"
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 w-64 h-full bg-black z-50 flex flex-col p-6"
            >
              <button onClick={() => setIsSidebarOpen(false)} className="self-end text-white mb-4">
                <X className="w-8 h-8" />
              </button>

              <nav className="flex flex-col gap-6">
                {navItems.map(item => {
                  if (!isHomePage && item.type === 'scroll') {
                    return (
                      <RouterLink
                        key={item.name}
                        to={`/#${item.to}`}
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-white hover:text-gray-300 text-lg"
                      >
                        {item.name}
                      </RouterLink>
                    );
                  }

                  if (item.type === 'scroll') {
                    return (
                      <ScrollLink
                        key={item.name}
                        to={item.to}
                        smooth={true}
                        duration={500}
                        offset={-80} // Account for fixed navbar height
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-white hover:text-gray-300 cursor-pointer text-lg"
                      >
                        {item.name}
                      </ScrollLink>
                    );
                  }

                  return (
                    <RouterLink
                      key={item.name}
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-white hover:text-gray-300 text-lg"
                    >
                      {item.name}
                    </RouterLink>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;