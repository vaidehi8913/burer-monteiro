
// assumes matrices are lists of {row: []} objects
export const matrixMultiply = ((m1, m2) =>
    {
        if (m1 == null || m2 == null || m1.length === 0 || m2.length === 0) return [];

        var result = m1.map((m1RowWrap, m1RowIndex) =>
            {
                var m1Row = m1RowWrap.row;

                var newRowData = m2[0].row.map((ignore, m2ColIndex) => 
                    {
                        var dotValues = m1Row.map((m1Value, m1ColIndex) =>
                            {
                                var m2Value = m2[m1ColIndex].row[m2ColIndex];
                                return (m1Value * m2Value);
                            }
                        );
                        var dotProduct = dotValues.reduce((a, b) => a + b, 0);
                        return dotProduct;
                    }
                );
                return ({row: newRowData});
            }
        );
        return result;
    }
);
