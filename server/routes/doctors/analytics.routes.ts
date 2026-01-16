import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase } from '../../database';

const router = Router();

// Get analytics for a doctor
router.get('/doctor/:doctorId', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { doctorId } = req.params;

    // Verify the user is this doctor
    if (req.user!.doctorId !== doctorId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Total appointments
    const totalResult = db.exec(`
      SELECT COUNT(*) FROM appointments WHERE doctor_id = ?
    `, [doctorId]);
    const totalAppointments = totalResult[0]?.values[0]?.[0] || 0;

    // Appointments by status
    const statusResult = db.exec(`
      SELECT status, COUNT(*) FROM appointments WHERE doctor_id = ? GROUP BY status
    `, [doctorId]);
    const appointmentsByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    };
    statusResult[0]?.values.forEach((row: any) => {
      appointmentsByStatus[row[0]] = row[1];
    });

    // Total unique patients
    const patientsResult = db.exec(`
      SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = ? AND patient_id IS NOT NULL
    `, [doctorId]);
    const totalPatients = patientsResult[0]?.values[0]?.[0] || 0;

    // Get doctor fee for revenue calculation
    const doctorResult = db.exec(`SELECT fee, rating FROM doctors WHERE id = ?`, [doctorId]);
    const fee = doctorResult[0]?.values[0]?.[0] || 0;
    const averageRating = doctorResult[0]?.values[0]?.[1] || 0;

    // Total revenue (completed appointments * fee)
    const totalRevenue = (appointmentsByStatus.completed || 0) * (fee as number);

    // Appointments by month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const appointmentsByMonth: { month: string; count: number }[] = [];
    
    const monthlyResult = db.exec(`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) 
      FROM appointments 
      WHERE doctor_id = ? AND date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `, [doctorId]);
    
    monthlyResult[0]?.values.forEach((row: any) => {
      const [year, month] = (row[0] as string).split('-');
      appointmentsByMonth.push({
        month: monthNames[parseInt(month) - 1],
        count: row[1] as number,
      });
    });

    // Calculate trends (comparing current month to previous month)
    const currentMonthCount = appointmentsByMonth[appointmentsByMonth.length - 1]?.count || 0;
    const prevMonthCount = appointmentsByMonth[appointmentsByMonth.length - 2]?.count || 1;
    const appointmentsTrend = Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100);

    res.json({
      success: true,
      data: {
        totalAppointments,
        appointmentsTrend: Math.min(Math.max(appointmentsTrend, -100), 100),
        totalPatients,
        patientsTrend: 5,
        totalRevenue,
        revenueTrend: 12,
        averageRating,
        ratingTrend: 0,
        appointmentsByStatus,
        appointmentsByMonth,
      }
    });
  } catch (error) {
    console.error('Get doctor analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

export default router;
