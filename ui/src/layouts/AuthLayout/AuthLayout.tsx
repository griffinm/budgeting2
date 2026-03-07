import { Outlet } from "react-router-dom";
import appIcon from './../../../public/android-chrome-512x512.png';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #2c4b80 0%, #3a5890 30%, #5474b4 60%, #5f7cb7 100%)',
      }}
    >
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <img src={appIcon} alt="BearBudget" className="w-16 h-16 rounded-2xl shadow-lg mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">BearBudget</h1>
          <p className="text-sm text-primary-200 mt-1">Take control of your finances</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
