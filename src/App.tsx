import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Legend,
} from "recharts";
import BubbleComponent from "./components/bubbleGrafic";

type PieDataType = {
  current: { name: string; value: number }[];
  vc: { name: string; value: number }[];
  debt: { name: string; value: number }[];
  blend: { name: string; value: number }[];
};

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
    exitMultiple: 30000000,
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

  const [pieData, setPieData] = useState<PieDataType>({
    current: [],
    vc: [],
    debt: [],
    blend: [],
  });

  // Colors for pie charts
  const COLORS = ["#0057FF", "#888888", "#000000"];

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    //operacion totalInterestPayments

    //Total Cost of Debt (Full Debt)
    const totalInterestPayments =
      fullDebtMonthlyPayment * inputs.ventureDebtTerm;

    const blendDebtMonthlyPayment =
      (debtAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, inputs.ventureDebtTerm)) /
      (Math.pow(1 + monthlyRate, inputs.ventureDebtTerm) - 1);
    //  Total Cost of Debt (Blend)
    const blendInterestPayments =
      blendDebtMonthlyPayment * inputs.ventureDebtTerm;

    // Calculate exit values
    const exitValuation = inputs.exitMultiple;
    const vcExitValue = (vcNewOwnership / 100) * exitValuation;
    const debtExitValue =
      (debtNewOwnership / 100) * (exitValuation - totalInterestPayments);
    const blendExitValue =
      (blendNewOwnership / 100) * (exitValuation - blendInterestPayments);

    setResults({
      vcDilution: Number(vcDilution.toFixed(1)),
      vcNewOwnership: Number(vcNewOwnership.toFixed(1)),
      vcOtherInvestorsNewOwnership: Number(
        vcOtherInvestorsNewOwnership.toFixed(1)
      ),
      vcNewInvestorOwnership: Number(vcNewInvestorOwnership.toFixed(1)),
      debtWarrantDilution: Number(warrantDilution.toFixed(1)),
      debtNewOwnership: Number(debtNewOwnership.toFixed(1)),
      debtOtherInvestorsNewOwnership: Number(
        debtOtherInvestorsNewOwnership.toFixed(1)
      ),
      debtNewInvestorOwnership: Number(debtNewInvestorOwnership.toFixed(1)),
      ownershipDifference: Number(
        (debtNewOwnership - vcNewOwnership).toFixed(1)
      ),
      vcExitValue: Number(vcExitValue.toFixed(0)),
      debtExitValue: Number(debtExitValue.toFixed(0)),
      exitValueDifference: Number((debtExitValue - vcExitValue).toFixed(0)),
      totalInterestPayments: Number(totalInterestPayments.toFixed(0)),
      blendDilution: Number(blendTotalDilution.toFixed(1)),
      blendNewOwnership: Number(blendNewOwnership.toFixed(1)),
      blendOtherInvestorsNewOwnership: Number(
        blendOtherInvestorsNewOwnership.toFixed(1)
      ),
      blendNewInvestorOwnership: Number(blendNewInvestorOwnership.toFixed(1)),
      blendExitValue: Number(blendExitValue.toFixed(0)),
      blendInterestPayments: Number(blendInterestPayments.toFixed(0)),
    });

    console.log(results);

    setPieData({
      current: [
        { name: "Founders", value: Number(inputs.founderOwnership) },
        {
          name: "Existing Investors",
          value: Number(inputs.otherInvestorsOwnership),
        },
        { name: "New Investors", value: 0 },
      ],
      vc: [
        { name: "Founders", value: Number(vcNewOwnership) },
        {
          name: "Existing Investors",
          value: Number(vcOtherInvestorsNewOwnership),
        },
        { name: "New Investors", value: Number(vcNewInvestorOwnership) },
      ],
      debt: [
        { name: "Founders", value: Number(debtNewOwnership) },
        {
          name: "Existing Investors",
          value: Number(debtOtherInvestorsNewOwnership),
        },
        { name: "New Investors", value: Number(debtNewInvestorOwnership) },
      ],
      blend: [
        { name: "Founders", value: Number(blendNewOwnership) },
        {
          name: "Existing Investors",
          value: Number(blendOtherInvestorsNewOwnership),
        },
        { name: "New Investors", value: Number(blendNewInvestorOwnership) },
      ],
    });
  }, [inputs]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // grafico de barras 1
  const currencyData1 = [
    {
      name: "Valuation\nUpon Exit",
      value: inputs.exitMultiple,
    },
  ];

  const simboly1 = [
    { name: "x", value: 0, type: "symbol" }, // Símbolo de multiplicación
  ];

  const simboly2 = [
    { name: "=", value: 0, type: "symbol" }, // Símbolo igual
  ];

  const percentageData = [
    {
      name: `Founder Ownership\nPost-Dilution`,
      value: results.vcNewOwnership.toFixed(1), // Asegúrate que este sea el valor porcentual
    },
  ];

  const currencyData2 = [
    {
      name: "Founder Profit at Exit\nwith Venture Capital",
      value: results.vcExitValue,
    },
  ];

  // grafico de barras 2

  const barra1 = [
    {
      name: "Valuation\nUpon Exit",
      value: inputs.exitMultiple,
    },
  ];

  const iconResta = [{ name: "-", value: 0, type: "symbol" }];

  const barra2 = [
    { name: "Total Cost\nof Debt", value: results.totalInterestPayments },
  ];

  const barra3 = [
    {
      name: `Founder Ownership`,
      value: results.debtNewOwnership.toFixed(1),
    },
  ];

  const barra4 = [
    {
      name: "Founder Profit at Exit\nwith Debt",
      value: results.debtExitValue,
    },
  ];

  const valorGlobo = (results.exitValueDifference / 1000000).toFixed(1);

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
          <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b border-gray-200 pb-2">
            Company Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Next Round Valuation
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  name="companyValuation"
                  value={
                    inputs.companyValuation
                      ? inputs.companyValuation.toLocaleString("en-US") // Formatea con comas de miles
                      : ""
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setInputs((prev) => ({
                      ...prev,
                      companyValuation: value ? parseFloat(value) : 0, // Convierte a número o usa 0
                    }));
                  }}
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Founder Ownership
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="founderOwnership"
                  value={inputs.founderOwnership}
                  onChange={handleInputChange}
                  className="w-full pr-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  max="100"
                  min="0"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Other Investors Ownership
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="otherInvestorsOwnership"
                  value={inputs.otherInvestorsOwnership}
                  disabled
                  className="w-full pr-7 p-2 bg-gray-100 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  max="100"
                  min="0"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Funding Needed
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  name="fundingNeeded"
                  value={
                    inputs.fundingNeeded
                      ? inputs.fundingNeeded.toLocaleString("en-US") // Formatea con comas de miles
                      : ""
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/[^0-9.]/g, ""); // Permite solo números y punto decimal
                    setInputs((prev) => ({
                      ...prev,
                      fundingNeeded: value ? parseFloat(value) : 0, // Convierte a número o usa 0
                    }));
                  }}
                  className="w-full pl-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 ">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-blue-600">
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
                    inputs.showHybridOption ? "bg-blue-600" : "bg-gray-300"
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
                    <label className="text-sm font-medium text-black">
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
                        className="w-full pr-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        max="100"
                        min="0"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-black">
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
                        className="w-full pr-7 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="bg-blue-600 h-2.5 rounded-full"
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

          <h2 className="text-lg font-semibold mt-6 mb-4 text-blue-600 border-b border-gray-200 pb-2">
            Venture Debt Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Total Debt Cost of Capital
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="ventureDebtInterestRate"
                  value={inputs.ventureDebtInterestRate}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              <label className="text-sm font-medium text-black">
                Term Length
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="ventureDebtTerm"
                  value={inputs.ventureDebtTerm}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">
                  mos
                </span>
              </div>
            </div>

            {/* Warrant Coverage (Debe tener el mismo ancho que los otros) */}
            <div className="md:col-span-1 space-y-2">
              <label className="text-sm font-medium text-black">
                Warrant Coverage
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="warrantCoverage"
                  value={inputs.warrantCoverage}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          <h2 className="text-lg font-semibold mt-6 mb-4 text-blue-600 border-b border-gray-200 pb-2">
            Exit Assumptions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Exit Valuation
              </label>
              <input
                type="text"
                name="exitMultiple"
                value={
                  inputs.exitMultiple
                    ? inputs.exitMultiple.toLocaleString("en-US") // Formatea con comas de miles
                    : ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  let value = e.target.value.replace(/[^0-9.]/g, ""); // Permite solo números y punto decimal
                  let numValue = parseFloat(value);

                  // Limita el valor mínimo a 1
                  if (value === "") {
                    value = "";
                  } else if (numValue < 1) {
                    value = "1";
                  }

                  setInputs((prev) => ({
                    ...prev,
                    exitMultiple: value ? parseFloat(value) : 0, // Convierte a número o usa 0
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md col-span-2">
        <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-center text-blue-600 border-b border-gray-200 pb-2">
          Founder Profit at Exit Valuation
        </h2>

        {/* Primera sección - Profit Difference */}
        <div className="flex flex-col items-center bg-gray-100 p-3 md:p-4 mb-4 rounded-lg w-full">
          <h3 className="text-sm md:text-lg font-bold mb-2 text-black text-center">
            Excess Founder Profit at Exit with Debt versus Venture Capital
          </h3>
          <div className="w-full flex justify-center overflow-visible">
            <BubbleComponent
              value={`$${valorGlobo}M`}
              exitMultiple={inputs.exitMultiple}
            />
          </div>
        </div>

        {/* Segunda sección - Primer gráfico */}
        <div className="flex flex-col items-center bg-gray-100 p-3 md:p-4 mb-4 rounded-lg w-full">
          <h3 className="text-sm md:text-lg font-bold mb-2 text-black text-center">
            Founder Profit at Exit with Venture Capital
          </h3>
          <div className="w-full h-64 md:h-72 lg:h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  ...currencyData1,
                  ...simboly1,
                  ...percentageData,
                  ...simboly2,
                  ...currencyData2,
                ]}
                margin={
                  window.innerWidth < 768
                    ? { top: 0, right: 20, left: 20, bottom: 30 } // Márgenes más amplias en móviles
                    : { top: 0, right: 0, left: 0, bottom: 30 }
                }
              >
                <XAxis
                  dataKey="name"
                  tick={
                    window.innerWidth < 768
                      ? false // Oculta etiquetas en móviles
                      : ({ x, y, payload }) => {
                          const lines = payload.value.split("\n");
                          return (
                            <text
                              x={x}
                              y={y + 10}
                              textAnchor="middle"
                              fill="#666"
                            >
                              {lines.map((line: string, index: number) => (
                                <tspan
                                  key={index}
                                  x={x}
                                  dy={index === 0 ? 0 : 14}
                                >
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          );
                        }
                  }
                />
                <YAxis
                  hide={true}
                  domain={[0, (dataMax: number) => dataMax * 1.2]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;

                    const name = payload[0].payload.name;
                    const isDisabledData =
                      simboly1.some((item) => item.name === name) ||
                      simboly2.some((item) => item.name === name) ||
                      percentageData.some((item) => item.name === name);

                    if (isDisabledData) {
                      return null;
                    }

                    return (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "10px",
                          border: "1px solid #ccc",
                          fontSize: 14,
                        }}
                      >
                        <p>{name}</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey={(dataPoint) =>
                    dataPoint && dataPoint.isPercentage
                      ? 0
                      : dataPoint?.value || 0
                  }
                  fill={"#0057FF"}
                  stroke="none"
                  barSize={window.innerWidth < 768 ? 50 : 100}
                  label={(props) => {
                    if (!props || !props.name) return <text />;

                    const { x, y, width, value, name, payload } = props;

                    const isSymbol =
                      simboly1.some((item) => item.name === name) ||
                      simboly2.some((item) => item.name === name);

                    const isPercentage =
                      payload?.isPercentage ||
                      percentageData.some((item) => item.name === name);

                    if (isPercentage) {
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 20}
                          fill="#888888"
                          textAnchor="middle"
                          fontSize="clamp(15px, 2vw, 16px)"
                          fontWeight="bold"
                        >
                          {`${value}%`}
                        </text>
                      );
                    }

                    if (isSymbol) {
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 20}
                          fill="#888888"
                          textAnchor="middle"
                          fontSize="clamp(40px, 3vw, 20px)"
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                      );
                    }

                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#333"
                        textAnchor="middle"
                        fontSize={15}
                        fontWeight="bold"
                      >
                        {formatCurrency(value)}
                      </text>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tercera sección - Segundo gráfico */}
        <div className="flex flex-col items-center bg-gray-100 p-3 md:p-4 mb-4 rounded-lg w-full">
          <h3 className="text-sm md:text-lg font-bold mb-2 text-black text-center">
            Founder Profit at Exit with Debt
          </h3>

          <div className="w-full h-64 md:h-72 lg:h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  ...barra1,
                  ...iconResta,
                  ...barra2,
                  ...simboly1,
                  ...barra3,
                  ...simboly2,
                  ...barra4,
                ]}
                margin={{ top: 20, right: 10, left: 10, bottom: 50 }}
              >
                <XAxis
                  dataKey="name"
                  tick={
                    window.innerWidth < 768
                      ? false // Oculta etiquetas en móviles
                      : ({ x, y, payload }) => {
                          const lines = payload.value.split("\n");
                          return (
                            <text
                              x={x}
                              y={y + 10}
                              textAnchor="middle"
                              fill="#666"
                            >
                              {lines.map((line: string, index: number) => (
                                <tspan
                                  key={index}
                                  x={x}
                                  dy={index === 0 ? 0 : 14}
                                >
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          );
                        }
                  }
                />

                <YAxis hide domain={[0, (dataMax: number) => dataMax * 1.2]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;

                    const name = payload[0].payload.name;
                    const isDisabledData =
                      simboly1.some((item) => item.name === name) ||
                      simboly2.some((item) => item.name === name) ||
                      iconResta.some((item) => item.name === name) ||
                      barra3.some((item) => item.name === name);

                    if (isDisabledData) return null;

                    return (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "10px",
                          border: "1px solid #ccc",
                          fontSize: 14,
                        }}
                      >
                        <p>{name}</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey={(dataPoint) =>
                    dataPoint && dataPoint.isPercentage
                      ? 0
                      : dataPoint?.value || 0
                  }
                  fill="#0057FF"
                  barSize={window.innerWidth < 768 ? 40 : 100}
                  name="value"
                  isAnimationActive={true}
                  // Esta es la parte nueva que agrega fill específico por barra
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    // Verificar si el dato pertenece a barra2
                    const isBarra2 = barra2.some(
                      (item) => item.name === payload.name
                    );
                    const barColor = isBarra2 ? "#000000" : "#0057FF";
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={barColor}
                      />
                    );
                  }}
                  label={(props) => {
                    if (!props || !props.name) return <text />;
                    const { x, y, width, value, name, payload } = props;

                    const isSymbol =
                      simboly1.some((item) => item.name === name) ||
                      simboly2.some((item) => item.name === name) ||
                      iconResta.some((item) => item.name === name);

                    const isPercentage =
                      payload?.isPercentage ||
                      barra3.some((item) => item.name === name);

                    if (isPercentage) {
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 20}
                          fill="#888888"
                          textAnchor="middle"
                          fontSize="clamp(15px, 2vw, 16px)"
                          fontWeight="bold"
                        >
                          {`${value}%`}
                        </text>
                      );
                    }

                    if (isSymbol) {
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 20}
                          fill="#888888"
                          textAnchor="middle"
                          fontSize="clamp(40px, 3vw, 20px)"
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                      );
                    }

                    return (
                      <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#333"
                        textAnchor="middle"
                        fontSize="clamp(10px, 2vw, 14px)"
                        fontWeight="bold"
                      >
                        {formatCurrency(value)}
                      </text>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
        <h2 className="text-lg font-semibold mb-6 text-center text-blue-600 border-b border-gray-200 pb-2">
          Equity Ownership Visualization
        </h2>
        <div className="flex flex-col items-center bg-gray-100 p-4 mb-4 rounded-lg w-full">
          <h3 className="text-lg font-bold mb-2 text-black">
            Current Ownership
          </h3>
          <div className="w-full max-w-2xl">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart margin={{ top: 100, right: 10, bottom: 70, left: 10 }}>
                <Pie
                  data={pieData.current}
                  cx="50%"
                  cy="40%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) =>
                    value > 5 ? `${value.toFixed(1)}%` : ""
                  }
                  labelLine={false}
                >
                  {pieData.current.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{ fontWeight: "bold" }}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value, entry) => {
                    return (
                      <span
                        style={{
                          color: entry.color,
                          fontWeight: "bold",
                          padding: "0 4px",
                          display: "inline-block",
                          fontSize: "16px",
                        }}
                      >
                        {value}: {entry.payload?.value.toFixed(1)}%
                      </span>
                    );
                  }}
                  wrapperStyle={{
                    bottom: 0,
                    fontSize: "12px",
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    lineHeight: "24px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Venture Debt Container */}
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6 shadow-md w-full">
            <h3 className="text-lg font-bold mb-4">After Venture Debt</h3>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart
                  margin={{ top: 100, right: 10, bottom: 70, left: 20 }}
                >
                  <Pie
                    data={pieData.debt}
                    cx="50%"
                    cy="40%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ value }) =>
                      value > 5 ? `${value.toFixed(1)}%` : ""
                    }
                    labelLine={false}
                  >
                    {pieData.current.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ fontWeight: "bold" }}
                      />
                    ))}
                  </Pie>

                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry) => {
                      console.log(entry);
                      return (
                        <span
                          style={{
                            color: entry.color,
                            fontWeight: "bold",
                            padding: "0 4px",
                            display: "inline-block",
                            fontSize: "16px",
                          }}
                        >
                          {value}: {entry.payload?.value.toFixed(1)}%
                        </span>
                      );
                    }}
                    wrapperStyle={{
                      bottom: 0,
                      fontSize: "12px",
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      lineHeight: "24px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center bg-[#6d93f5] p-3 rounded-lg">
              <span className="text-white font-semibold text-base">
                Only {results.debtWarrantDilution.toFixed(1)}% dilution
              </span>
            </div>
          </div>

          {/* Venture Capital Container */}
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6 shadow-md w-full">
            <h3 className="text-lg text-center font-bold mb-4">
              After Venture Capital
            </h3>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart
                  margin={{ top: 100, right: 20, bottom: 70, left: 10 }}
                >
                  <Pie
                    data={pieData.vc}
                    cx="50%"
                    cy="40%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ value }) =>
                      value > 5 ? `${value.toFixed(1)}%` : ""
                    }
                    labelLine={false}
                  >
                    {pieData.current.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ fontWeight: "bold" }}
                      />
                    ))}
                  </Pie>

                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry) => {
                      return (
                        <span
                          style={{
                            color: entry.color,
                            fontWeight: "bold",
                            padding: "0 4px",
                            display: "inline-block",
                            fontSize: "16px",
                          }}
                        >
                          {value}: {entry.payload?.value.toFixed(1)}%
                        </span>
                      );
                    }}
                    wrapperStyle={{
                      bottom: 0,
                      fontSize: "12px",
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      lineHeight: "24px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center bg-[#6d93f5] p-3 rounded-lg">
              <span className="text-white font-semibold text-base">
                {results.vcDilution.toFixed(1)}% dilution
              </span>
            </div>
          </div>
        </div>

        {inputs.showHybridOption && (
          <div className="flex flex-col items-center bg-gray-100 rounded-lg p-4 shadow-md mb-8">
            <h3 className="text-md font-bold mb-2">
              Blend: {inputs.vcPercentage.toFixed(1)}% Venture Capital /{" "}
              {inputs.ventureDebtPercentage.toFixed(1)}% Debt
            </h3>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart
                  margin={{ top: 100, right: 60, bottom: 70, left: 10 }}
                >
                  <Pie
                    data={pieData.blend}
                    cx="50%"
                    cy="40%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ value }) =>
                      value > 5 ? `${value.toFixed(1)}%` : ""
                    }
                    labelLine={false}
                  >
                    {pieData.current.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ fontWeight: "bold" }}
                      />
                    ))}
                  </Pie>
                  Solución concisa para formatear valores decimales
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry) => {
                      return (
                        <span
                          style={{
                            color: entry.color,
                            fontWeight: "bold",
                            padding: "0 4px",
                            display: "inline-block",
                            fontSize: "16px",
                          }}
                        >
                          {value}: {entry.payload?.value.toFixed(1)}%
                        </span>
                      );
                    }}
                    wrapperStyle={{
                      bottom: 0,
                      fontSize: "12px",
                      width: "100%",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      lineHeight: "24px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center bg-[#6d93f5] p-2 rounded-lg">
              <span className="text-sky-50 font-semibold">
                {results.blendDilution.toFixed(1)}% dilution
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
        <div className="grid grid-cols-1  gap-6">
          <div className="bg-gray-100 p-5 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-center text-blue-600 border-b border-gray-200 pb-2">
              Financing Impact Summary
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">
                  Founder Ownership with Venture Capital:
                </span>
                <span className="font-semibold">
                  {results.vcNewOwnership.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Founder Ownership with Debt:</span>
                <span className="font-semibold">
                  {results.debtNewOwnership.toFixed(1)}%
                </span>
              </div>

              {inputs.showHybridOption && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Founder Ownership with Blend:</span>
                  <span className="font-semibold">
                    {results.blendNewOwnership.toFixed(1)}%
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#608df7] mb-1">
                <span className="text-sm">Equity Preserved with Debt:</span>
                <span className="font-semibold">
                  +{results.ownershipDifference.toFixed(1)}%
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Founder Profit at Exit with Venture Capital:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(results.vcExitValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Founder Profit at Exit with Debt:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(results.debtExitValue)}
                  </span>
                </div>

                {inputs.showHybridOption && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Founder Profit with Blend:</span>
                    <span className="font-semibold">
                      {formatCurrency(results.blendExitValue)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-sm">
                    Total Cost of Debt (Full Debt):
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(results.totalInterestPayments)}
                  </span>
                </div>

                {/* {inputs.showHybridOption && (
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-sm">Total interest (Blend):</span>
                    <span className="font-semibold">
                      {formatCurrency(results.blendInterestPayments)}
                    </span>
                  </div>
                )} */}

                <div className="flex items-center justify-between text-[#608df7]">
                  <span className="text-sm">
                    Estimated Excess Founder Profit at Exit with Debt versus
                    Venture Capital:
                  </span>
                  <span className="font-semibold">
                    +{formatCurrency(results.exitValueDifference)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-5 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-center text-blue-600 border-b border-gray-200 pb-2">
              Key Insights
            </h3>

            <ul className="space-y-3 text-sm">
              {(results.ownershipDifference ?? 0) > 0 ? (
                <li className="flex items-start">
                  <span className="text-[#0057FF] mr-2">■</span>
                  <span>
                    With venture debt, you retain{" "}
                    <span className="font-semibold">
                      {results.ownershipDifference.toFixed(1)}% more equity
                    </span>
                    , which translates to{" "}
                    <span className="font-semibold">
                      {formatCurrency(results.exitValueDifference)}
                    </span>{" "}
                    more net value at exit.
                  </span>
                </li>
              ) : (
                <li className="flex items-start">
                  <span className="text-[#608df7] mr-2">■</span>
                  <span>
                    In this scenario, venture debt does not provide significant
                    equity preservation benefits.
                  </span>
                </li>
              )}

              <li className="flex items-start">
                <span className="text-[#608df7] mr-2">■</span>
                <span>
                  Venture debt dilution is limited to warrant dilution of{" "}
                  {results.debtWarrantDilution.toFixed(1)}%, compared to venture
                  capital dilution of {results.vcDilution.toFixed(1)}%.
                </span>
              </li>

              {inputs.showHybridOption && (
                <li className="flex items-start">
                  <span className="text-[#0057FF] mr-2">■</span>
                  <span>
                    The blended approach allows you to balance equity
                    preservation and cash flow needs.
                  </span>
                </li>
              )}

              {(results.totalInterestPayments ?? 0) <
              (results.exitValueDifference ?? 0) ? (
                <li className="flex items-start">
                  <span className="text-[#608df7] mr-2">■</span>
                  <span>
                    Total cost of debt of{" "}
                    {formatCurrency(results.totalInterestPayments)} is lower
                    than the additional exit value of{" "}
                    {formatCurrency(results.exitValueDifference)}, making debt
                    financially advantageous.
                  </span>
                </li>
              ) : (
                <li className="flex items-start">
                  <span className="text-[#608df7] mr-2">■</span>
                  <span>
                    Total cost of debt of{" "}
                    {formatCurrency(results.totalInterestPayments)} may offset
                    some of the equity preservation benefits.
                  </span>
                </li>
              )}

              <li className="flex items-start ">
                <span className="text-[#0057FF] mr-2">■</span>
                <span>Venture debt is ideally suited for companies with:</span>
              </li>

              <ul className="ml-6 space-y-2 border-b border-gray-200 pb-2">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">○</span>
                  <span>
                    Strong revenue or cash flow to service debt payments
                  </span>
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
              <li className="flex items-start pt-2">
                <span className="text-[#000000] mr-2">■</span>
                <span>
                  {inputs.showHybridOption
                    ? "The optimal blend of VC and venture debt depends on your company's cash needs, growth trajectory, and equity goals."
                    : "Consider a hybrid approach: smaller equity round plus venture debt to optimize capital structure."}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#000000] mr-2">■</span>
                <span>
                  Note: Warrant coverage means the lender gets the right to
                  purchase shares equal to X% of the loan amount at a
                  predetermined price, typically based on the company's latest
                  valuation. For example, on a $10M loan with 10.0% warrant
                  coverage, the lender would receive warrants to buy $1M worth
                  of equity today at the agreed price.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#000000] mr-2">■</span>
                <span>
                  Note: Assumes {inputs.ventureDebtTerm} months of amortization.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-100 p-5 rounded-lg">
            <h3 className="text-lg font-medium mb-1 text-black ">
              Disclaimer:
            </h3>

         
                <span className="flex items-start text-sm">
                This tool is for general informational purposes only and does not constitute legal, financial, or other professional advice. We make no warranties or representations of any kind, express or implied, regarding its accuracy, completeness, or reliability, as it is intended for estimation purposes only. We are not responsible for any actions taken or decisions made in reliance of this tool or the resulting calculations.
                </span>
          
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
