import React from 'react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Box } from '@chakra-ui/react';
import { LinkButton } from './link';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

export function Dash() {
  const deep = useDeep();
  const [user] = deep.useMinilinksSubscription({ id: deep.linkId });
  const packages = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Package'),
  });
  const { data: usersCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'User'),
  }, { aggregate: 'count' });
  const { data: rejectesCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Rejected'),
  }, { aggregate: 'count' });
  const { data: resolvesCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Resolved'),
  }, { aggregate: 'count' });
  const { data: calculatingCount }: any = deep.useSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Promise'),
    _not: { out: { type_id: { _in: [deep.idLocal('@deep-foundation/core', 'Rejected'), deep.idLocal('@deep-foundation/core', 'Resolved')] } } },
  }, { aggregate: 'count' });
  const dataProcesses = [
    {name: 'rejectes', value: rejectesCount},
    {name: 'resolves', value: resolvesCount},
    {name: 'calculating', value: calculatingCount},
  ]
  console.log('resolvesCount', resolvesCount)
  return <Box w='100%' h='100%'>
    <PureComponent data={dataProcesses} />
    <Box><LinkButton id={deep.linkId}/></Box>
    <Box>packages: {packages.length || '?'}</Box>
    <Box>usersCount: {usersCount || '?'}</Box>
    <Box>rejectesCount: {rejectesCount || '?'}</Box>
    <Box>resolvesCount: {resolvesCount || '?'}</Box>
    <Box>calculatingCount: {calculatingCount || '?'}</Box>
  </Box>;
}



const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const RADIAN = Math.PI / 90;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
const PureComponent = ({ data }: { data: any; }) => {
    return (
      <PieChart width={800} height={400}>
        <Pie
          data={data}
          cx={420}
          cy={200}
          startAngle={180}
          label={renderCustomizedLabel}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
}
