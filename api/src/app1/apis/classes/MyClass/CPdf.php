<?php
namespace MyClass;

\DJApi\Configs::readConfigOnce('api-lib/tcpdf/tcpdf.php');

use \DJApi;
use \TCPDF;

class CPdf extends TCPDF {

  public $pdf;

  public function __construct($title) {
    parent::__construct('P', 'mm', 'A4', true, 'UTF-8', false);
    $this->create($title);
  }

  /**
   * 重载函数
   */
  public function getRight() {
    return $this->w - $this->rMargin;
  }
  public function getClientWidth() {
    return $this->w - $this->lMargin - $this->rMargin;
  }
  public function getBottom() {
    return $this->h - $this->bMargin;
  }
  public function getClientHeight() {
    return $this->h - $this->bMargin - $this->tMargin;
  }

  /**
   * 创建定制格式
   */
  public function create($title) {
    // 设置文档信息
    $this->SetCreator('莆田海事局');
    $this->SetAuthor('莆田市蒲公英信息科技有限公司');
    $this->SetTitle($title);
    $this->SetSubject('TCPDF Tutorial');
    $this->SetKeywords('TCPDF, PDF');

    // 设置页眉和页脚信息
    $this->SetHeaderData('', 1, '', $title, [128, 128, 128], [192, 192, 192]);
    $this->setFooterData([128, 128, 128], [192, 192, 192]);

    // 设置页眉和页脚字体
    $this->setHeaderFont(Array('stsongstdlight', '', '10'));
    $this->setFooterFont(Array('helvetica', '', '8'));

    // 设置默认等宽字体
    $this->SetDefaultMonospacedFont('courier');

    // 设置间距
    $this->SetMargins(25, 30, 25);
    $this->setHeaderMargin(15);
    $this->SetFooterMargin(10);

    // 设置分页
    $this->SetAutoPageBreak(TRUE, 25);

    // set image scale factor
    $this->setImageScale(1.0);

    // set default font subsetting mode
    $this->setFontSubsetting(true);

    //设置字体
    $this->SetFont('stsongstdlight', '', 14);
    return $this;
  }

  /**
   * 设置字体
   * @param a, b, c: 自动，数字=字体大小，字符串=粗体斜体，数组=字体颜色
   */
  public function qfont($vs) {
    if (is_array($vs)) {
      foreach ($vs as $v) {
        if (is_array($v)) {
          $this->setColor('text', $v[0], $v[1], $v[2]);
        } elseif (is_string($v)) {
          $this->SetFont('', $v);
        } elseif (is_numeric($v)) {
          $this->SetFont('', $this->getFontStyle(), $v);
        }
      }
    }

  }

  /**
   * 一行两部分文字
   */
  public function text_ab($texta, $textb, $w, $qfonta = false, $qfontb = false) {
    if (!$qfonta) {
      $qfonta = [[0, 0, 0]];
    }
    if (!$qfontb) {
      $qfontb = [[64, 64, 64]];
    }
    $this->qfont($qfonta);
    $this->Cell($w, 10, $texta, 0, 0, 'R');
    $this->qfont($qfontb);
    $this->Cell(0, 10, $textb, 0, 1);
  }

  /**
   * 一行多部分文字
   * @param texts: 各栏的文本
   * @param colSettings: 各栏设置，['w', 'qfont']
   */
  public function text_abc($texts, $colSettings) {
    $colCount = count($colSettings);
    for ($i = 0; $i < $colCount; $i++) {
      $qfont = $colSettings[$i]['qfont'];
      $w = $colSettings[$i]['w'];
      $this->qfont($qfont);
      $this->Cell($w, 10, $texts[$i], 0, $i == $colCount - 1 ? 1 : 0);
    }
  }

  /**
   * 一行多部分文字
   * @param texts: 各栏的文本
   * @param colSettings: 各栏设置，['w', 'qfont']
   */
  public function qImage($url, $rect, $options) {
    $defaults = [
      'type' => '',
      'link' => '',
      'align' => '',
      'resize' => false,
      'dpi' => 300,
      'palign' => '',
      'ismask' => false,
      'imgmask' => false,
      'border' => 0,
      'fitbox' => false,
      'hidden' => false,
      'fitonpage' => false,
      'alt' => false,
      'altimgs' => [],
    ];
    $values = [];
    foreach ($defaults as $k => $v) {
      $values[$k] = isset($options[$k]) ? $options[$k] : $defaults[$k];
    }
    $this->Image($url, $rect[0], $rect[1], $rect[2], $rect[3],
      $values['type'],
      $values['link'],
      $values['align'],
      $values['resize'],
      $values['dpi'],
      $values['palign'],
      $values['ismask'],
      $values['imgmask'],
      $values['border'],
      $values['fitbox'],
      $values['hidden'],
      $values['fitonpage'],
      $values['alt'],
      $values['altimgs']
    );
  }

}
