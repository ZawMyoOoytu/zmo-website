import React from 'react';

const Table = ({ columns, data, onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>{column.title}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              {columns.map(column => (
                <td key={column.key}>
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
              <td className="actions">
                <button onClick={() => onEdit(item)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(item._id)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;