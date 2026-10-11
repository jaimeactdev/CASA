"use client";

import { useState } from "react";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { colors, fontSizes } from "@/styles/designTokens";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import InputFieldMUI from "@/shared/ui/mui/InputFieldMUI";
import CheckboxFieldMUI from "@/shared/ui/mui/CheckboxFieldMUI";
import HoverIconButton from "@/shared/ui/mui/HoverIconButton";
import AppDialog from "@/shared/ui/Modal/AppDialog";
import DatatableLocal from "@/shared/ui/primereact/Datatable/DatatableLocal";
import { renderEstadoDisplayValue } from "@/shared/ui/StatusIndicatorCell";
import { useSettingsViewModel } from "../viewmodel/useSettingsViewModel";
import type { PaymentMethodRecord } from "../domain/settingsTypes";

export default function SettingsView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<PaymentMethodRecord[]>([]);
  const vm = useSettingsViewModel();
  const fieldHalf = { ...theme.customStyleForm.grid6md, display: "block" };
  const fieldFull = { ...theme.customStyleForm.grid12md, display: "block" };

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: fontSizes.xl,
          fontWeight: 600,
          color: colors.textPrincipal,
        }}
      >
        Parámetros
      </Typography>
      <Typography
        sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}
      >
        Configuración de la asociación y medios de pago. El nombre del panel
        sigue saliendo de la identidad del producto; estos datos alimentan la
        página pública y las cuotas nuevas.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>
          {vm.loadError}
        </Typography>
      ) : null}

      <Paper
        elevation={0}
        component="form"
        onSubmit={vm.onSubmit}
        noValidate
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "16px",
        }}
      >
        <Typography
          sx={{ fontWeight: 600, mb: 2, color: colors.textPrincipal }}
        >
          Asociación
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 3 }}>
          <Box sx={fieldFull}>
            <InputFieldMUI
              name="name"
              label="Nombre"
              value={vm.values.name}
              onChange={vm.onChangeName}
              error={vm.errors.name}
              disabled={!vm.canEdit}
              maxlenght={160}
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="acronym"
              label="Sigla"
              value={vm.values.acronym}
              onChange={vm.onChangeAcronym}
              error={vm.errors.acronym}
              disabled={!vm.canEdit}
              maxlenght={20}
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="serviceCity"
              label="Ciudad de servicios"
              value={vm.values.serviceCity}
              onChange={vm.onChangeServiceCity}
              error={vm.errors.serviceCity}
              disabled={!vm.canEdit}
              maxlenght={80}
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="phone"
              label="Teléfono"
              value={vm.values.phone}
              onChange={vm.onChangePhone}
              error={vm.errors.phone}
              disabled={!vm.canEdit}
              keyfilter="pnum"
              maxlenght={30}
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="contactEmail"
              label="Correo"
              value={vm.values.contactEmail}
              onChange={vm.onChangeContactEmail}
              error={vm.errors.contactEmail}
              disabled={!vm.canEdit}
              keyfilter="email"
              maxlenght={120}
            />
          </Box>
          <Box sx={fieldFull}>
            <InputFieldMUI
              name="address"
              label="Dirección"
              value={vm.values.address}
              onChange={vm.onChangeAddress}
              error={vm.errors.address}
              disabled={!vm.canEdit}
              maxlenght={200}
            />
          </Box>
          <Box sx={fieldFull}>
            <InputFieldMUI
              name="openingHours"
              label="Horario"
              value={vm.values.openingHours}
              onChange={vm.onChangeOpeningHours}
              error={vm.errors.openingHours}
              disabled={!vm.canEdit}
              maxlenght={200}
            />
          </Box>
        </Box>

        <Typography
          sx={{ fontWeight: 600, mt: 4, mb: 2, color: colors.textPrincipal }}
        >
          Cuotas
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", rowGap: 3 }}>
          <Box sx={fieldFull}>
            <InputFieldMUI
              name="minimumWage"
              label="SMMLV"
              value={vm.values.minimumWage}
              onChange={vm.onChangeMinimumWage}
              error={vm.errors.minimumWage}
              disabled={!vm.canEdit}
              keyfilter="pint"
              formatThousands
              maxlenght={12}
              smallText="Salario mínimo vigente. Las cuotas nuevas se calculan sobre este valor."
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="firstFeeCutoffDay"
              label="Día de corte de la primera cuota"
              value={vm.values.firstFeeCutoffDay}
              onChange={vm.onChangeFirstFeeCutoffDay}
              error={vm.errors.firstFeeCutoffDay}
              disabled={!vm.canEdit}
              keyfilter="pint"
              maxlenght={2}
              smallText="No genera la cuota. Si el día de afiliación es posterior, la primera cuota se reduce."
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="firstFeePercent"
              label="Porcentaje de la primera cuota reducida"
              value={vm.values.firstFeePercent}
              onChange={vm.onChangeFirstFeePercent}
              error={vm.errors.firstFeePercent}
              disabled={!vm.canEdit}
              keyfilter="money"
              maxlenght={6}
              smallText="Solo la primera cuota mensual, si se afilió después del corte. 50 = la mitad."
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="graceDays"
              label="Días de holgura"
              value={vm.values.graceDays}
              onChange={vm.onChangeGraceDays}
              error={vm.errors.graceDays}
              disabled={!vm.canEdit}
              keyfilter="pint"
              maxlenght={2}
              smallText="Días después de fin de mes en los que la cuota sigue Pendiente."
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="surchargePercent"
              label="Recargo por mora (% del SMMLV al mes)"
              value={vm.values.surchargePercent}
              onChange={vm.onChangeSurchargePercent}
              error={vm.errors.surchargePercent}
              disabled={!vm.canEdit}
              keyfilter="money"
              maxlenght={6}
              smallText="No es un porcentaje de la cuota. Se suma el SMMLV × este % por cada mes de atraso."
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="enrollmentFee"
              label="Cuota única de ingreso"
              value={vm.values.enrollmentFee}
              onChange={vm.onChangeEnrollmentFee}
              error={vm.errors.enrollmentFee}
              disabled={!vm.canEdit}
              keyfilter="pint"
              formatThousands
              maxlenght={12}
              smallText="Cobro único al afiliar, si es mayor que 0. No es la cuota mensual."
            />
          </Box>
          <Box sx={fieldFull}>
            <CheckboxFieldMUI
              name="allowMultiFeePayment"
              label="Permitir pagar varias cuotas a la vez"
              checked={vm.values.allowMultiFeePayment}
              onChange={vm.onChangeAllowMultiFeePayment}
              disabled={!vm.canEdit}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "16px",
            bgcolor: colors.brandTint,
          }}
        >
          <Typography
            sx={{ fontWeight: 600, color: colors.textPrincipal, mb: 1 }}
          >
            Cómo se calcula (se actualiza al escribir)
          </Typography>
          {vm.preview.wageIsZero ? (
            <Typography sx={{ color: colors.textSecondary }}>
              Con el SMMLV en 0 no se puede afiliar ni generar cuotas.
            </Typography>
          ) : (
            <>
              <Typography sx={{ color: colors.textSecondary, mb: 1.5 }}>
                Cada perfil de afiliación tiene su propio porcentaje sobre el
                SMMLV. La cuota se genera el mes en curso para afiliados
                activos; el día de corte solo decide si la primera cuota sale
                reducida.
              </Typography>
              {vm.preview.profiles.length === 0 ? (
                <Typography sx={{ color: colors.textSecondary }}>
                  No hay perfiles activos para previsualizar.
                </Typography>
              ) : (
                vm.preview.profiles.map((profile) => (
                  <Typography
                    key={profile.name}
                    sx={{ color: colors.textPrincipal, mb: 0.5 }}
                  >
                    {profile.name} ({profile.percentLabel} del SMMLV): cuota
                    plena {profile.fullFeeLabel}
                    {vm.preview.cutoffDay
                      ? ` · si se afilia después del día ${vm.preview.cutoffDay}: ${profile.reducedFeeLabel}`
                      : ""}
                  </Typography>
                ))
              )}
              <Typography sx={{ color: colors.textSecondary, mt: 1.5 }}>
                Recargo por mora: {vm.preview.surchargeLabel} por cada mes de
                atraso (sobre el SMMLV, no sobre la cuota).
                {vm.preview.enrollmentLabel}
              </Typography>
            </>
          )}
        </Box>

        {vm.formError ? (
          <Typography sx={{ color: colors.error, mt: 2 }}>
            {vm.formError}
          </Typography>
        ) : null}

        {vm.canEdit ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <HoverIconButton
              text="Guardar parámetros"
              type="submit"
              disabled={vm.isSaving}
              sx={theme.customButtons.primary}
            />
          </Box>
        ) : (
          <Typography sx={{ mt: 2, color: colors.textSecondary }}>
            Tu rol solo permite ver estos parámetros.
          </Typography>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
            Medios de pago
          </Typography>
          {vm.canEdit ? (
            <HoverIconButton
              text="Nuevo medio"
              type="button"
              onClick={vm.openCreateMethod}
              sx={theme.customButtons.secondary}
            />
          ) : null}
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.paymentMethods}
          rows={10}
          columns={[
            { field: "name", header: "Nombre", minWidth: 160 },
            { field: "sortOrder", header: "Orden", minWidth: 80 },
            {
              field: "estadoDisplay",
              header: "Estado",
              minWidth: 120,
              body: (row: PaymentMethodRecord) =>
                renderEstadoDisplayValue(row.estadoDisplay),
            },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel={false}
          showEditButton={vm.canEdit}
          onEditButtonClick={vm.openEditMethod}
          showActivateButton={
            vm.canEdit
              ? (row: PaymentMethodRecord) => row.estado === "I"
              : false
          }
          onActivateButtonClick={vm.activateMethod}
          showInactivateButton={
            vm.canEdit
              ? (row: PaymentMethodRecord) => row.estado === "A"
              : false
          }
          onInactivateButtonClick={vm.inactivateMethod}
          tipoViewAcciones="Menu"
        />
      </Paper>

      <AppDialog open={Boolean(vm.moneyConfirm)} onClose={vm.cancelMoneyChange}>
        <DialogTitle>Confirmar cambio de valores</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Las cuotas ya generadas no cambian. El valor nuevo entra solo en las
            que se creen después.
          </Typography>
          {vm.moneyConfirmLines.map((line) => (
            <Typography key={line} sx={{ fontWeight: 600 }}>
              {line}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <HoverIconButton
            text="Cancelar"
            type="button"
            onClick={vm.cancelMoneyChange}
            sx={theme.customButtons.secondary}
          />
          <HoverIconButton
            text="Confirmar"
            type="button"
            disabled={vm.isSaving}
            onClick={vm.confirmMoneyChange}
            sx={theme.customButtons.primary}
          />
        </DialogActions>
      </AppDialog>

      <AppDialog open={vm.methodOpen} onClose={vm.closeMethod}>
        <Box component="form" onSubmit={vm.saveMethod} noValidate>
          <DialogTitle>
            {vm.editingMethod ? "Editar medio de pago" : "Nuevo medio de pago"}
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
          >
            <InputFieldMUI
              name="paymentMethodName"
              label="Nombre"
              value={vm.methodValues.name}
              onChange={vm.onChangeMethodName}
              error={vm.methodErrors.name}
              maxlenght={80}
            />
            <InputFieldMUI
              name="paymentMethodSort"
              label="Orden"
              value={vm.methodValues.sortOrder}
              onChange={vm.onChangeMethodSortOrder}
              error={vm.methodErrors.sortOrder}
              keyfilter="pint"
              maxlenght={4}
            />
            {vm.methodError ? (
              <Typography sx={{ color: colors.error }}>
                {vm.methodError}
              </Typography>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <HoverIconButton
              text="Cancelar"
              type="button"
              onClick={vm.closeMethod}
              sx={theme.customButtons.secondary}
            />
            <HoverIconButton
              text="Guardar"
              type="submit"
              disabled={vm.isSavingMethod}
              sx={theme.customButtons.primary}
            />
          </DialogActions>
        </Box>
      </AppDialog>
    </Box>
  );
}
