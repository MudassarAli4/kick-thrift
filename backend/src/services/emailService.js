import nodemailer from 'nodemailer'
import { loadEnv } from '../config/env.js'

// Create transporter
function createTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = loadEnv()
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER || 'officalreportsdep@gmail.com',
      pass: EMAIL_PASS || 'jtzhuezzcnqvqdfy'
    }
  })
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(order) {
  try {
    const transporter = createTransporter()
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.productName}</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('')
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Successfully Placed!</h1>
            </div>
            <div class="content">
              <p>Dear ${order.delivery.firstName} ${order.delivery.lastName},</p>
              
              <p>Thank you for your order! We have received your order and it is being processed.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
              </div>
              
              <div class="order-details">
                <h3>Delivery Address</h3>
                <p>
                  ${order.delivery.firstName} ${order.delivery.lastName}<br>
                  ${order.delivery.address}${order.delivery.apartment ? ', ' + order.delivery.apartment : ''}<br>
                  ${order.delivery.city}, ${order.delivery.country}${order.delivery.postalCode ? ' ' + order.delivery.postalCode : ''}<br>
                  Phone: ${order.delivery.phone}
                </p>
              </div>
              
              <div class="order-details">
                <h3>Order Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                <div class="total">
                  <strong>Total: Rs. ${order.total.toLocaleString()}</strong>
                </div>
              </div>
              
              <p>We will notify you once your order is shipped. If you have any questions, please contact us.</p>
              
              <p>Thank you for shopping with us!</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const mailOptions = {
      from: 'officalreportsdep@gmail.com',
      to: order.contact.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: htmlContent
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send order delivered email
export async function sendOrderDeliveredEmail(order) {
  try {
    const transporter = createTransporter()
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order Has Been Delivered!</h1>
            </div>
            <div class="content">
              <p>Dear ${order.delivery.firstName} ${order.delivery.lastName},</p>
              
              <p>Great news! Your order has been delivered successfully.</p>
              
              <div class="order-details">
                <h3>Order Information</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="highlight">
                <p><strong>📦 Delivery Information:</strong></p>
                <p>Your order has been delivered to your address:</p>
                <p>
                  ${order.delivery.address}${order.delivery.apartment ? ', ' + order.delivery.apartment : ''}<br>
                  ${order.delivery.city}, ${order.delivery.country}
                </p>
                ${order.trackingId ? `
                <div style="background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border: 2px solid #28a745;">
                  <p style="margin: 0 0 10px;"><strong>🚚 Tracking Information:</strong></p>
                  <p style="margin: 5px 0;"><strong>Courier:</strong> ${order.courier || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 1.1em; color: #007bff;">${order.trackingId}</span></p>
                  ${order.courier === 'TCS' ? `
                    <p style="margin: 10px 0 0;"><a href="https://www.tcsexpress.com/tracking/${order.trackingId}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order on TCS Website</a></p>
                  ` : order.courier === 'M&P' ? `
                    <p style="margin: 10px 0 0;"><a href="https://www.mulphilog.com/tracking/${order.trackingId}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order on M&P Website</a></p>
                  ` : order.courier ? `
                    <p style="margin: 10px 0 0; color: #666;">Please contact ${order.courier} customer service with your tracking ID to track your order.</p>
                  ` : ''}
                </div>
                ` : ''}
                <p><strong>You will receive your order at the above address within 4 to 5 days.</strong></p>
              </div>
              
              <p>If you have any questions or concerns about your order, please contact us.</p>
              
              <p>Thank you for your patience!</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const mailOptions = {
      from: 'officalreportsdep@gmail.com',
      to: order.contact.email,
      subject: `Order Delivered - ${order.orderNumber}`,
      html: htmlContent
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Order delivered email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending order delivered email:', error)
    return { success: false, error: error.message }
  }
}

// Send updated tracking information email to customer
export async function sendUpdatedTrackingEmail(order, oldTrackingId, oldCourier) {
  try {
    const transporter = createTransporter()
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
            .highlight { background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Updated Delivery Details</h1>
            </div>
            <div class="content">
              <p>Dear ${order.delivery.firstName} ${order.delivery.lastName},</p>
              
              <p>We have updated the delivery details for your order. Please find the updated tracking information below:</p>
              
              <div class="order-details">
                <h3>Order Information</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Update Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Important Notice:</strong></p>
                <p style="margin: 5px 0 0;">We apologize for any inconvenience. The previous tracking information was mistakenly added. Please use the updated tracking details below.</p>
              </div>
              
              <div class="highlight">
                <p><strong>🚚 Updated Tracking Information:</strong></p>
                ${order.trackingId ? `
                <div style="background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border: 2px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>Courier:</strong> ${order.courier || 'N/A'}</p>
                  <p style="margin: 5px 0;"><strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 1.1em; color: #007bff;">${order.trackingId}</span></p>
                  ${order.courier === 'TCS' ? `
                    <p style="margin: 10px 0 0;"><a href="https://www.tcsexpress.com/tracking/${order.trackingId}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order on TCS Website</a></p>
                  ` : order.courier === 'M&P' ? `
                    <p style="margin: 10px 0 0;"><a href="https://www.mulphilog.com/tracking/${order.trackingId}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order on M&P Website</a></p>
                  ` : order.courier ? `
                    <p style="margin: 10px 0 0; color: #666;">Please contact ${order.courier} customer service with your tracking ID to track your order.</p>
                  ` : ''}
                </div>
                ` : '<p>Tracking information has been updated. Please contact us for more details.</p>'}
              </div>
              
              <p>If you have any questions or concerns about your order, please contact us.</p>
              
              <p>Thank you for your patience!</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const mailOptions = {
      from: 'officalreportsdep@gmail.com',
      to: order.contact.email,
      subject: `Updated Delivery Details - ${order.orderNumber}`,
      html: htmlContent
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Updated tracking email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending updated tracking email:', error)
    return { success: false, error: error.message }
  }
}

// Send order notification to admin
export async function sendOrderNotificationToAdmin(order) {
  try {
    const transporter = createTransporter()
    const { EMAIL_USER } = loadEnv()
    const adminEmail = EMAIL_USER || 'officalreportsdep@gmail.com'
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.productName}</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('')
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
            .alert { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Order Received!</h1>
            </div>
            <div class="content">
              <div class="alert">
                <p style="margin: 0;"><strong>New order has been placed and requires your attention!</strong></p>
              </div>
              
              <div class="order-details">
                <h3>Order Information</h3>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; color: #dc3545; font-weight: bold;">Rs. ${order.total.toLocaleString()}</span></p>
              </div>
              
              <div class="order-details">
                <h3>Customer Information</h3>
                <p><strong>Email:</strong> ${order.contact.email}</p>
                <p><strong>Name:</strong> ${order.delivery.firstName} ${order.delivery.lastName}</p>
                <p><strong>Phone:</strong> ${order.delivery.phone}</p>
              </div>
              
              <div class="order-details">
                <h3>Delivery Address</h3>
                <p>
                  ${order.delivery.firstName} ${order.delivery.lastName}<br>
                  ${order.delivery.address}${order.delivery.apartment ? ', ' + order.delivery.apartment : ''}<br>
                  ${order.delivery.city}, ${order.delivery.country}${order.delivery.postalCode ? ' ' + order.delivery.postalCode : ''}<br>
                  Phone: ${order.delivery.phone}
                </p>
              </div>
              
              <div class="order-details">
                <h3>Order Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                <div class="total">
                  <strong>Total: Rs. ${order.total.toLocaleString()}</strong>
                </div>
              </div>
              
              <div class="order-details">
                <h3>Payment Information</h3>
                <p><strong>Method:</strong> ${order.payment.method.toUpperCase()}</p>
                <p><strong>Status:</strong> ${order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}</p>
              </div>
              
              <p style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 5px;">
                <strong>Action Required:</strong> Please review this order in your admin dashboard and process it accordingly.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your e-commerce system.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const mailOptions = {
      from: adminEmail,
      to: adminEmail,
      subject: `🔔 New Order Received - ${order.orderNumber}`,
      html: htmlContent
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Order notification email sent to admin:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending order notification to admin:', error)
    return { success: false, error: error.message }
  }
}

