namespace ESOAF.Trade.PRD.<var_txnCode>.Query
{
    using System;
    using System.Data;
    using System.Threading.Tasks;
    using Esoaf.AP.Services.Databases;
    using Esoaf.Core.Trade.Base;
    using Esoaf.Kernel.Api;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// <var_txnName> - 查詢功能
    /// </summary>
    [Txn]
    public class Query : TxnBase
    {
        private readonly ProdDatabase prodDatabase;

        public class QueryRequest
        {
<var_queryClass>
            public int? DGPage { get; set; }
        }

        public class QueryResponse
        {
            public DataTable DgRowData { get; set; }
            public int DgRowCount { get; set; }
        }

        public Query(IServiceProvider serviceProvider, ProdDatabase prodDatabase) : base(serviceProvider)
        {
            this.prodDatabase = prodDatabase;
        }

        [TxnAction]
        public async Task<ApiResult> Process(QueryRequest request)
        {
            Logger.LogTrace("{txnName} Process start", GetType().Name);
            ValidateRequest(request);
            using var dbTransaction = prodDatabase.BeginTransaction();
            using var cmd = prodDatabase.CreateCommand();
            string sql = @"
<var_querySql>
";
<var_queryContent>
            cmd.CommandText = sql;
            var (dgRowData, dgRowCount) = ExecutePagedDataTable(Database, cmd, request.DGPage ?? 0, 20);
            AuditCmd(cmd);

            dbTransaction.Commit();
            Logger.LogTrace("{txnName} Process done", GetType().Name);

            return SuccessResult(new QueryResponse
            {
                DgRowData = dgRowData,
                DgRowCount = dgRowCount,
            });
        }

        private void ValidateRequest(QueryRequest request)
        {
            if (request == null)
            {
                Logger.LogError("request是null");
                throw new ApiException("Z9999", $"{nameof(request)} 是 null");
            }
        }
    }
}
