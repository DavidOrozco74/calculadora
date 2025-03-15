import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

function App() {
  const [inputs, setInputs] = useState({
    companyValuation: 10000000,
    founderOwnership: 60,
    otherInvestorsOwnership: 40,
    fundingNeeded: 2000000,
    vcPercentage: 50,
    ventureDebtPercentage: 50,
    ventureDebtInterestRate: 12,
    ventureDebtTerm: 36,
    warrantCoverage: 10,
    exitMultiple: 3,
    exitTimeframe: 4,
    showHybridOption: false,
  });

  // Results state
  const [results, setResults] = useState({
    vcDilution: 0,
    vcNewOwnership: 0,
    vcOtherInvestorsNewOwnership: 0,
    vcNewInvestorOwnership: 0,
    debtWarrantDilution: 0,
    debtNewOwnership: 0,
    debtOtherInvestorsNewOwnership: 0,
    debtNewInvestorOwnership: 0,
    ownershipDifference: 0,
    vcExitValue: 0,
    debtExitValue: 0,
    exitValueDifference: 0,
    totalInterestPayments: 0,
    // Blend results
    blendDilution: 0,
    blendNewOwnership: 0,
    blendOtherInvestorsNewOwnership: 0,
    blendNewInvestorOwnership: 0,
    blendExitValue: 0,
    blendInterestPayments: 0,
  });

  // Pie chart data
  const [pieData, setPieData] = useState({
    current: [],
    vc: [],
    debt: [],
    blend: [],
  });

  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update other investors automatically when founder ownership changes
    if (name === "founderOwnership") {
      setInputs((prev) => ({
        ...prev,
        [name]: parseFloat(value),
        otherInvestorsOwnership: 100 - parseFloat(value),
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    }
  };

  // Calculate results whenever inputs change
  useEffect(() => {
    // Calculate funding amounts for each source
    const vcAmount = inputs.fundingNeeded * (inputs.vcPercentage / 100);
    const debtAmount =
      inputs.fundingNeeded * (inputs.ventureDebtPercentage / 100);

    // Calculate VC dilution
    const vcSharesIssued =
      inputs.fundingNeeded / (inputs.companyValuation / 100);
    const vcDilution = vcSharesIssued;
    const vcNewOwnership = (inputs.founderOwnership * (100 - vcDilution)) / 100;
    const vcOtherInvestorsNewOwnership =
      (inputs.otherInvestorsOwnership * (100 - vcDilution)) / 100;
    const vcNewInvestorOwnership =
      100 - vcNewOwnership - vcOtherInvestorsNewOwnership;

    // Calculate Venture Debt impacts
    const warrantDilution =
      (inputs.fundingNeeded * (inputs.warrantCoverage / 100)) /
      (inputs.companyValuation / 100);
    const debtNewOwnership =
      (inputs.founderOwnership * (100 - warrantDilution)) / 100;
    const debtOtherInvestorsNewOwnership =
      (inputs.otherInvestorsOwnership * (100 - warrantDilution)) / 100;
    const debtNewInvestorOwnership =
      100 - debtNewOwnership - debtOtherInvestorsNewOwnership;

    // Calculate Blend impacts
    const blendVCSharesIssued = vcAmount / (inputs.companyValuation / 100);
    const blendWarrantDilution =
      (debtAmount * (inputs.warrantCoverage / 100)) /
      (inputs.companyValuation / 100);
    const blendTotalDilution = blendVCSharesIssued + blendWarrantDilution;
    const blendNewOwnership =
      (inputs.founderOwnership * (100 - blendTotalDilution)) / 100;
    const blendOtherInvestorsNewOwnership =
      (inputs.otherInvestorsOwnership * (100 - blendTotalDilution)) / 100;
    const blendNewInvestorOwnership =
      100 - blendNewOwnership - blendOtherInvestorsNewOwnership;

    // Calculate total interest payments for full debt and blend
    const monthlyRate = inputs.ventureDebtInterestRate / 100 / 12;
    const fullDebtMonthlyPayment =
      (inputs.fundingNeeded *
        monthlyRate *
        Math.pow(1 + monthlyRate, inputs.ventureDebtTerm)) /
      (Math.pow(1 + monthlyRate, inputs.ventureDebtTerm) - 1);
    const totalInterestPayments =
      fullDebtMonthlyPayment * inputs.ventureDebtTerm - inputs.fundingNeeded;

    const blendDebtMonthlyPayment =
      (debtAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, inputs.ventureDebtTerm)) /
      (Math.pow(1 + monthlyRate, inputs.ventureDebtTerm) - 1);
    const blendInterestPayments =
      blendDebtMonthlyPayment * inputs.ventureDebtTerm - debtAmount;

    // Calculate exit values
    const exitValuation = inputs.companyValuation * inputs.exitMultiple;
    const vcExitValue = (vcNewOwnership / 100) * exitValuation;
    const debtExitValue = (debtNewOwnership / 100) * exitValuation;
    const blendExitValue = (blendNewOwnership / 100) * exitValuation;

    setResults({
      vcDilution: vcDilution.toFixed(2),
      vcNewOwnership: vcNewOwnership.toFixed(2),
      vcOtherInvestorsNewOwnership: vcOtherInvestorsNewOwnership.toFixed(2),
      vcNewInvestorOwnership: vcNewInvestorOwnership.toFixed(2),
      debtWarrantDilution: warrantDilution.toFixed(2),
      debtNewOwnership: debtNewOwnership.toFixed(2),
      debtOtherInvestorsNewOwnership: debtOtherInvestorsNewOwnership.toFixed(2),
      debtNewInvestorOwnership: debtNewInvestorOwnership.toFixed(2),
      ownershipDifference: (debtNewOwnership - vcNewOwnership).toFixed(2),
      vcExitValue: vcExitValue.toFixed(0),
      debtExitValue: debtExitValue.toFixed(0),
      exitValueDifference: (debtExitValue - vcExitValue).toFixed(0),
      totalInterestPayments: totalInterestPayments.toFixed(0),
      // Blend results
      blendDilution: blendTotalDilution.toFixed(2),
      blendNewOwnership: blendNewOwnership.toFixed(2),
      blendOtherInvestorsNewOwnership:
        blendOtherInvestorsNewOwnership.toFixed(2),
      blendNewInvestorOwnership: blendNewInvestorOwnership.toFixed(2),
      blendExitValue: blendExitValue.toFixed(0),
      blendInterestPayments: blendInterestPayments.toFixed(0),
    });

    // Update pie chart data
    setPieData({
      current: [
        { name: "Founders", value: inputs.founderOwnership },
        { name: "Existing Investors", value: inputs.otherInvestorsOwnership },
        { name: "New Investors", value: 0 },
      ],
      vc: [
        { name: "Founders", value: parseFloat(vcNewOwnership) },
        {
          name: "Existing Investors",
          value: parseFloat(vcOtherInvestorsNewOwnership),
        },
        { name: "New Investors", value: parseFloat(vcNewInvestorOwnership) },
      ],
      debt: [
        { name: "Founders", value: parseFloat(debtNewOwnership) },
        {
          name: "Existing Investors",
          value: parseFloat(debtOtherInvestorsNewOwnership),
        },
        { name: "New Investors", value: parseFloat(debtNewInvestorOwnership) },
      ],
      blend: [
        { name: "Founders", value: parseFloat(blendNewOwnership) },
        {
          name: "Existing Investors",
          value: parseFloat(blendOtherInvestorsNewOwnership),
        },
        { name: "New Investors", value: parseFloat(blendNewInvestorOwnership) },
      ],
    });
  }, [inputs]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p className="font-medium">{payload[0].name}</p>
          <p>{`${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-100  shadow-md space-y-6">
      <div className="p-8 rounded-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Venture Debt vs. Venture Capital
        </h1>
        <p className="text-gray-600 text-lg">
          Compare how different financing options affect your equity and exit
          value
        </p>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
          <h2 className="text-lg font-semibold mb-4 text-indigo-700 border-b pb-2">
            Company Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Current Valuation
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="companyValuation"
                  value={inputs.companyValuation}
                  onChange={handleInputChange}
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Founder Ownership
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="founderOwnership"
                  value={inputs.founderOwnership}
                  onChange={handleInputChange}
                  className="w-full pr-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  max="100"
                  min="0"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Other Investors Ownership
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="otherInvestorsOwnership"
                  value={inputs.otherInvestorsOwnership}
                  disabled
                  className="w-full pr-7 p-2 bg-gray-100 border border-gray-300 rounded-md"
                  max="100"
                  min="0"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Funding Needed
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="fundingNeeded"
                  value={inputs.fundingNeeded}
                  onChange={handleInputChange}
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 ">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {inputs.showHybridOption
                  ? "Hybrid Financing View Enabled"
                  : "Enable Hybrid Financing View"}
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={inputs.showHybridOption}
                  onChange={(e) => {
                    setInputs((prev) => ({
                      ...prev,
                      showHybridOption: e.target.checked,
                    }));
                  }}
                />
                <div
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 duration-300 ease-in-out ${
                    inputs.showHybridOption ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                      inputs.showHybridOption ? "translate-x-6" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            {inputs.showHybridOption && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">
                      Venture Capital %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="vcPercentage"
                        value={inputs.vcPercentage}
                        onChange={(e) => {
                          const vcValue = Math.min(
                            100,
                            Math.max(0, parseFloat(e.target.value) || 0)
                          );
                          setInputs((prev) => ({
                            ...prev,
                            vcPercentage: vcValue,
                            ventureDebtPercentage: 100 - vcValue,
                          }));
                        }}
                        className="w-full pr-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        max="100"
                        min="0"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">
                      Venture Debt %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="ventureDebtPercentage"
                        value={inputs.ventureDebtPercentage}
                        onChange={(e) => {
                          const debtValue = Math.min(
                            100,
                            Math.max(0, parseFloat(e.target.value) || 0)
                          );
                          setInputs((prev) => ({
                            ...prev,
                            ventureDebtPercentage: debtValue,
                            vcPercentage: 100 - debtValue,
                          }));
                        }}
                        className="w-full pr-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        max="100"
                        min="0"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${inputs.vcPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Venture Capital: $
                    {formatCurrency(
                      (inputs.fundingNeeded * inputs.vcPercentage) / 100
                    )}
                  </span>
                  <span>
                    Venture Debt: $
                    {formatCurrency(
                      (inputs.fundingNeeded * inputs.ventureDebtPercentage) /
                        100
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4 text-indigo-700 border-b pb-2">
            Venture Debt Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interest Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="ventureDebtInterestRate"
                  value={inputs.ventureDebtInterestRate}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  max="30"
                  min="0"
                  step="0.5"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
                  %
                </span>
              </div>
            </div>

            {/* Term Length */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Term Length
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="ventureDebtTerm"
                  value={inputs.ventureDebtTerm}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
                  mos
                </span>
              </div>
            </div>

            {/* Warrant Coverage (Debe tener el mismo ancho que los otros) */}
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Warrant Coverage
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="warrantCoverage"
                  value={inputs.warrantCoverage}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  max="100"
                  min="0"
                  step="0.5"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
                  %
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Percentage of debt that converts to equity via warrants
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4 text-indigo-700 border-b pb-2">
            Exit Assumptions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Exit Valuation Multiple
              </label>
              <input
                type="number"
                name="exitMultiple"
                value={inputs.exitMultiple}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="1"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Exit Timeframe
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="exitTimeframe"
                  value={inputs.exitTimeframe}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="1"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
                  yrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-lg font-semibold mb-6 text-indigo-700 border-b pb-2">Equity Ownership Visualization</h2>
          
          <div className={`grid grid-cols-1 ${inputs.showHybridOption ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-8`}>
            <div className="flex flex-col items-center">
              <h3 className="text-md font-medium mb-2 text-gray-700">Current Ownership</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.current}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.current.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex flex-col items-center bg-green-50 rounded-lg p-4 shadow-md border-2 border-green-200">
              <h3 className="text-md font-bold mb-2 text-green-800">After Venture Debt</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.debt}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.debt.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center bg-green-100 p-2 rounded-lg">
                <span className="text-green-700 font-semibold">Only -{results.debtWarrantDilution}% dilution</span>
              </div>
            </div>
            
            {inputs.showHybridOption && (
              <div className="flex flex-col items-center bg-purple-50 rounded-lg p-4 shadow-md border-2 border-purple-200">
                <h3 className="text-md font-bold mb-2 text-purple-800">Blend: {inputs.vcPercentage}% Venture Capital / {inputs.ventureDebtPercentage}% Debt</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData.blend}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                        labelLine={false}
                      >
                        {pieData.blend.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center bg-purple-100 p-2 rounded-lg">
                  <span className="text-purple-700 font-semibold">-{results.blendDilution}% dilution</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center opacity-85">
              <h3 className="text-md font-medium mb-2 text-gray-700">After Venture Capital Funding</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.vc}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value.toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.vc.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                <span className="text-red-500 font-medium">-{results.vcDilution}% dilution</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium mb-4 text-blue-800">Financing Impact Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Founder Ownership with Venture Capital:</span>
                  <span className="font-semibold">{results.vcNewOwnership}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Founder Ownership with Debt:</span>
                  <span className="font-semibold">{results.debtNewOwnership}%</span>
                </div>
                
                {inputs.showHybridOption && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Founder Ownership with Blend:</span>
                    <span className="font-semibold">{results.blendNewOwnership}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-green-700">
                  <span className="text-sm">Equity Preserved with Debt:</span>
                  <span className="font-semibold">+{results.ownershipDifference}%</span>
                </div>
                
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Founder Value at Exit (Venture Capital):</span>
                    <span className="font-semibold">{formatCurrency(results.vcExitValue)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Founder Value at Exit (Debt):</span>
                    <span className="font-semibold">{formatCurrency(results.debtExitValue)}</span>
                  </div>
                  
                  {inputs.showHybridOption && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Founder Value at Exit (Blend):</span>
                      <span className="font-semibold">{formatCurrency(results.blendExitValue)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-green-700">
                    <span className="text-sm">Additional Exit Value (Debt vs Venture Capital):</span>
                    <span className="font-semibold">+{formatCurrency(results.exitValueDifference)}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex items-center justify-between text-red-600">
                    <span className="text-sm">Total Interest (100% Debt):</span>
                    <span className="font-semibold">{formatCurrency(results.totalInterestPayments)}</span>
                  </div>
                  
                  {inputs.showHybridOption && (
                    <div className="flex items-center justify-between text-red-600">
                      <span className="text-sm">Total Interest (Blend):</span>
                      <span className="font-semibold">{formatCurrency(results.blendInterestPayments)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-medium mb-4 text-indigo-800">Key Insights</h3>
              
              <ul className="space-y-3 text-sm">
                {parseFloat(results.ownershipDifference) > 0 ? (
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">●</span>
                    <span>With venture debt, you retain <span className="font-semibold">{results.ownershipDifference}% more equity</span>, which translates to <span className="font-semibold">{formatCurrency(results.exitValueDifference)}</span> more value at exit.</span>
                  </li>
                ) : (
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">●</span>
                    <span>In this scenario, venture debt does not provide significant equity preservation benefits.</span>
                  </li>
                )}
                
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">●</span>
                  <span>Venture debt dilution is limited to warrant coverage of {inputs.warrantCoverage}%, compared to Venture Capital dilution of {results.vcDilution}%.</span>
                </li>
                
                {inputs.showHybridOption && (
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">●</span>
                    <span>The blended approach allows you to balance equity preservation and cash flow needs.</span>
                  </li>
                )}
                
                {parseFloat(results.totalInterestPayments) < parseFloat(results.exitValueDifference) ? (
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">●</span>
                    <span>Interest payments of {formatCurrency(results.totalInterestPayments)} are lower than the additional exit value of {formatCurrency(results.exitValueDifference)}, making debt financially advantageous.</span>
                  </li>
                ) : (
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">●</span>
                    <span>Interest payments of {formatCurrency(results.totalInterestPayments)} may offset some of the equity preservation benefits.</span>
                  </li>
                )}
                
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">●</span>
                  <span>Venture debt is ideally suited for companies with:</span>
                </li>
                
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">○</span>
                    <span>Strong revenue or cash flow to service debt payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">○</span>
                    <span>Clear path to additional funding or profitability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">○</span>
                    <span>Founders who prioritize ownership retention</span>
                  </li>
                </ul>
                
                <li className="flex items-start pt-2 border-t border-indigo-200">
                  <span className="text-purple-500 mr-2">●</span>
                  <span>{inputs.showHybridOption 
                    ? "The optimal blend of VC and venture debt depends on your company's cash needs, growth trajectory, and equity goals." 
                    : "Consider a hybrid approach: smaller equity round plus venture debt to optimize capital structure."}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

    </div>
  );
}

export default App;
