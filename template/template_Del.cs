namespace ESOAF.Trade.PRD.<var_txnCode>.AddEditDel
{
    using System;
    using System.Data;
    using System.Threading.Tasks;
    using Esoaf.AP.Services.Databases;
    using Esoaf.Core.Trade.Base;
    using Esoaf.Kernel.Api;
    using Microsoft.Extensions.Logging;

    /// <summary>
    /// <var_txnName> - 刪除
    /// </summary>
    [Txn]
    public class Del : TxnBase
    {
        private readonly ProdDatabase prodDatabase;

        public class DelRequest
        {
            public string <var_pkColumn> { get; set; }
        }

        public Del(IServiceProvider serviceProvider, ProdDatabase prodDatabase) : base(serviceProvider)
        {
            this.prodDatabase = prodDatabase;
        }

        [TxnAction]
        public async Task<ApiResult> Process(DelRequest request)
        {
            Logger.LogTrace("{txnName} Process start", GetType().Name);
            ValidateRequest(request);

            using var dbTransaction = prodDatabase.BeginTransaction();
            using var cmd = prodDatabase.CreateCommand();

            cmd.CommandText = @"
DELETE FROM dbo.<var_dataName>
WHERE <var_pkColumn> = @<var_pkColumn>
";

            cmd.Parameters.Add("<var_pkColumn>", SqlDbType.<var_pkColumnType>).Value = request.<var_pkColumn>;
            int effectCount = Database.ExecuteNonQuery(cmd);
            dbTransaction.Commit();

            if (effectCount <= 0)
            {
                Logger.LogTrace("{txnName} Process done", GetType().Name);
                return Fail("E0004");
            }

            Logger.LogTrace("{txnName} Process done", GetType().Name);
            return Success("A0004");
        }

        private void ValidateRequest(DelRequest request)
        {
            if (request == null)
            {
                Logger.LogError("request是null");
                throw new ApiException("Z9999", $"{nameof(request)} 是 null");
            }
        }
    }
}
