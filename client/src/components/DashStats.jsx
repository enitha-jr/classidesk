const DashStats = ({ stats }) => {

  return (

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

      {stats.map((stat, index) => (

        <div
          key={index}
          className={`${stat.bg} p-4 rounded-lg shadow`}
        >
          <p className={`${stat.labelColor} text-sm`}>
            {stat.label}
          </p>

          <p className={`${stat.valueColor} text-2xl font-bold`}>
            {stat.value}
          </p>

        </div>

      ))}

    </div>

  );

};

export default DashStats;
