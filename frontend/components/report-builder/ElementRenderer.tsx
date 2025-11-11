'use client';

import { ReportElement } from './types';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '../ui/Charts';
import { OptimizedImage } from '../ui/OptimizedImage';

interface ElementRendererProps {
  element: ReportElement;
}

export function ElementRenderer({ element }: ElementRendererProps) {
  switch (element.type) {
    case 'text':
      return (
        <div
          style={{
            fontSize: element.config.fontSize || 14,
            fontWeight: element.config.fontWeight || 'normal',
            textAlign: element.config.align || 'left',
            ...element.styles,
          }}
        >
          {element.config.content || 'Text'}
        </div>
      );

    case 'table':
      const columns = element.config.columns || [];
      const data = element.config.data || [];
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            {element.config.showHeader && columns.length > 0 && (
              <thead>
                <tr>
                  {columns.map((col: string, idx: number) => (
                    <th key={idx} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {data.slice(0, 5).map((row: any[], rowIdx: number) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length > 5 && (
                <tr>
                  <td colSpan={columns.length} className="text-center text-gray-500 py-2">
                    ... dan {data.length - 5} baris lainnya
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );

    case 'chart':
      const chartData = element.config.data || [];
      const chartType = element.config.chartType || 'bar';
      const dataKey = element.config.dataKey || 'value';

      if (chartType === 'line') {
        return <LineChartComponent data={chartData} dataKey={dataKey} height={element.position.height || 200} />;
      } else if (chartType === 'pie') {
        return <PieChartComponent data={chartData} dataKey={dataKey} height={element.position.height || 200} />;
      } else {
        return <BarChartComponent data={chartData} dataKey={dataKey} height={element.position.height || 200} />;
      }

    case 'image':
      return (
        <OptimizedImage
          src={element.config.src || ''}
          alt={element.config.alt || ''}
          width={element.config.width || 100}
          height={element.config.height || 100}
          objectFit="contain"
          quality={85}
        />
      );

    case 'query':
      const queryData = element.config.data || [];
      return (
        <div>
          {element.config.error ? (
            <div className="text-red-500 text-sm">Error: {element.config.error}</div>
          ) : (
            <div>
              <div className="text-sm text-gray-600 mb-2">Query Results ({queryData.length} rows)</div>
              {queryData.length > 0 && (
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr>
                      {Object.keys(queryData[0]).map((key) => (
                        <th key={key} className="border border-gray-300 px-2 py-1 bg-gray-100">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryData.slice(0, 3).map((row: any, idx: number) => (
                      <tr key={idx}>
                        {Object.values(row).map((val: any, cellIdx: number) => (
                          <td key={cellIdx} className="border border-gray-300 px-2 py-1">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      );

    case 'line':
      return (
        <hr
          style={{
            borderStyle: element.config.style || 'solid',
            borderColor: element.config.color || '#000000',
            borderWidth: `${element.config.thickness || 1}px`,
            width: '100%',
          }}
        />
      );

    case 'spacer':
      return <div style={{ height: `${element.config.height || 20}px` }} />;

    default:
      return <div className="text-gray-400">Unknown element type</div>;
  }
}

