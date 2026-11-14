import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";

const AOSRefresh = () => {
  const location = useLocation();
  
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  return null;
};

export default AOSRefresh;

